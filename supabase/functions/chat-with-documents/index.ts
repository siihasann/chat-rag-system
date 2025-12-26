import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate embedding using Google's free embedding API
async function generateEmbedding(text: string, googleApiKey: string): Promise<number[]> {
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
          parts: [{ text }],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google embedding error:", errorText);
    throw new Error("Failed to generate embedding");
  }

  const data = await response.json();
  return data.embedding.values;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspaceId, question, conversationHistory = [], documentIds = null } = await req.json();

    console.log("Chat request received:", { workspaceId, question, documentIds });

    if (!workspaceId || !question) {
      return new Response(
        JSON.stringify({ error: "workspaceId and question are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate embedding for the question using Google's free API
    console.log("Generating embedding for question...");
    const queryEmbedding = await generateEmbedding(question, GOOGLE_API_KEY);

    // Search for relevant document chunks
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Searching documents with embedding length:", queryEmbedding.length);
    
    // Lower threshold to 0.3 for better recall - semantic similarity is often lower than expected
    const { data: searchResults, error: searchError } = await supabase.rpc(
      "search_documents",
      {
        p_workspace_id: workspaceId,
        p_embedding: JSON.stringify(queryEmbedding),
        p_match_threshold: 0.3,
        p_match_count: 10,
      }
    );

    console.log("Search results count:", searchResults?.length || 0);
    if (searchResults && searchResults.length > 0) {
      console.log("Top result similarity:", searchResults[0].similarity);
      console.log("Document IDs in results:", searchResults.map((r: any) => r.document_id));
    }

    if (searchError) {
      console.error("Search error:", searchError);
      throw new Error("Failed to search documents");
    }

    // Filter results by selected documents if specified
    let filteredResults = searchResults || [];
    if (documentIds && documentIds.length > 0) {
      console.log("Filtering by document IDs:", documentIds);
      filteredResults = filteredResults.filter((result: any) => 
        documentIds.includes(result.document_id)
      );
      console.log(`Filtered to ${filteredResults.length} results from selected documents`);
    }

    // Take top 5 after filtering
    filteredResults = filteredResults.slice(0, 5);

    // Build context from search results
    let context = "";
    if (filteredResults && filteredResults.length > 0) {
      context = filteredResults
        .map((result: any) => 
          `[Document: ${result.document_name}]\n${result.content}`
        )
        .join("\n\n---\n\n");
    }

    // Build messages for the AI
    const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided document context. 

Instructions:
- Answer questions based ONLY on the provided document context
- If the context doesn't contain relevant information, say so clearly
- Be concise but thorough in your responses
- Cite which document the information comes from when relevant
- If asked about something not in the documents, politely explain that you can only answer based on the uploaded documents

${context ? `Document Context:\n${context}` : "No relevant documents found for this query."}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: question },
    ];

    // Call Lovable AI Gateway with streaming
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("Failed to get AI response");
    }

    // Return the streaming response
    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
