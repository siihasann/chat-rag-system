import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";
import { extractText } from "https://esm.sh/unpdf@0.11.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function splitTextIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunkEnd = end;
    
    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + CHUNK_SIZE / 2) {
        chunkEnd = breakPoint + 1;
      }
    }
    
    const chunk = text.slice(start, chunkEnd).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    start = chunkEnd - CHUNK_OVERLAP;
    if (start < 0) start = 0;
    if (chunkEnd >= text.length) break;
  }
  
  return chunks;
}

async function extractTextFromPdf(fileContent: Uint8Array): Promise<string> {
  try {
    console.log("Starting PDF extraction with unpdf...");
    const result = await extractText(fileContent);
    
    // unpdf returns { text: string, totalPages: number } or { text: string[] }
    let text = '';
    if (Array.isArray(result.text)) {
      text = result.text.join('\n');
    } else {
      text = result.text || '';
    }
    console.log(`Extracted ${text.length} characters from ${result.totalPages || 'unknown'} pages`);
    
    return text.trim();
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw error;
  }
}

async function extractTextFromFile(fileContent: Uint8Array, mimeType: string, fileName: string): Promise<string> {
  if (mimeType === 'text/plain') {
    return new TextDecoder().decode(fileContent);
  }
  
  if (mimeType === 'application/pdf') {
    try {
      const text = await extractTextFromPdf(fileContent);
      if (text && text.trim().length > 0) {
        return text;
      }
      console.warn("PDF extraction returned empty text");
    } catch (error) {
      console.error("PDF extraction failed:", error);
    }
    return `Document: ${fileName} (PDF text extraction failed)`;
  }
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // For DOCX, extract text from XML content
    const text = new TextDecoder('utf-8', { fatal: false }).decode(fileContent);
    
    // Simple extraction of text content
    const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    let extractedText = textMatches.map(m => {
      const match = m.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
      return match ? match[1] : '';
    }).join(' ');
    
    if (extractedText.trim().length === 0) {
      return `Document: ${fileName} (DOCX content)`;
    }
    
    return extractedText.trim();
  }
  
  return `Document: ${fileName}`;
}

// Generate embedding using Google's free embedding API with retry logic
async function generateEmbedding(text: string, googleApiKey: string, retries = 3): Promise<number[]> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        console.log(`Retry attempt ${attempt + 1}/${retries}`);
      }
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${googleApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: {
              parts: [{ text: text.slice(0, 8000) }],
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Google embedding error:", error);
        
        if (response.status >= 500) {
          lastError = new Error(`Google API error (${response.status}): ${error}`);
          continue;
        }
        
        throw new Error(`Failed to generate embedding: ${error}`);
      }

      const data = await response.json();
      return data.embedding.values;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.error(`Embedding attempt ${attempt + 1} failed:`, lastError.message);
    }
  }
  
  throw lastError || new Error("Failed to generate embedding after retries");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();
    
    if (!documentId) {
      return new Response(JSON.stringify({ error: "documentId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!googleApiKey) {
      return new Response(JSON.stringify({ error: "Google API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      console.error("Document fetch error:", docError);
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing document:", document.name);

    // Update status to processing
    await supabase
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.file_path);

    if (downloadError || !fileData) {
      console.error("File download error:", downloadError);
      await supabase
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);
      return new Response(JSON.stringify({ error: "Failed to download file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract text
    const fileContent = new Uint8Array(await fileData.arrayBuffer());
    const extractedText = await extractTextFromFile(fileContent, document.mime_type, document.name);
    
    console.log("Extracted text length:", extractedText.length);
    console.log("Extracted text preview:", extractedText.substring(0, 500));

    // Check if extraction was successful
    if (extractedText.includes("text extraction failed") || extractedText.length < 50) {
      await supabase
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);
      return new Response(JSON.stringify({ 
        error: "Failed to extract text from document. The PDF may be image-based or encrypted.",
        extractedLength: extractedText.length
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Split into chunks
    const chunks = splitTextIntoChunks(extractedText);
    console.log("Number of chunks:", chunks.length);

    // Delete existing chunks for this document
    await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", documentId);

    // Generate embeddings and store chunks
    let successfulChunks = 0;
    let failedChunks = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}, length: ${chunk.length}`);
      
      try {
        const embedding = await generateEmbedding(chunk, googleApiKey);
        
        const { error: insertError } = await supabase
          .from("document_chunks")
          .insert({
            document_id: documentId,
            workspace_id: document.workspace_id,
            chunk_index: i,
            content: chunk,
            embedding: embedding,
          });

        if (insertError) {
          console.error("Chunk insert error:", insertError);
          failedChunks++;
        } else {
          successfulChunks++;
        }
      } catch (embeddingError) {
        console.error("Embedding error for chunk:", i, embeddingError);
        failedChunks++;
      }
    }

    const finalStatus = successfulChunks > 0 ? "completed" : "failed";
    
    await supabase
      .from("documents")
      .update({ 
        status: finalStatus,
        processed_at: successfulChunks > 0 ? new Date().toISOString() : null
      })
      .eq("id", documentId);

    console.log(`Document processing ${finalStatus}: ${successfulChunks}/${chunks.length} chunks successful`);

    if (successfulChunks === 0) {
      return new Response(JSON.stringify({ 
        error: "Failed to process any chunks. Please try again.",
        chunksProcessed: 0,
        chunksFailed: failedChunks
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      chunksProcessed: successfulChunks,
      chunksFailed: failedChunks,
      extractedTextLength: extractedText.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Process document error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
