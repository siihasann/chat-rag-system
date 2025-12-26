import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

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
          parts: [{ text: text.slice(0, 8000) }],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Google embedding error:", error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspaceId, query, matchThreshold = 0.5, matchCount = 5 } = await req.json();
    
    if (!workspaceId || !query) {
      return new Response(JSON.stringify({ error: "workspaceId and query are required" }), {
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

    console.log("Searching documents for query:", query);

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query, googleApiKey);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the search function
    const { data: results, error } = await supabase.rpc('search_documents', {
      p_workspace_id: workspaceId,
      p_embedding: queryEmbedding,
      p_match_threshold: matchThreshold,
      p_match_count: matchCount,
    });

    if (error) {
      console.error("Search error:", error);
      return new Response(JSON.stringify({ error: "Search failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Search results:", results?.length || 0);

    return new Response(JSON.stringify({ 
      success: true, 
      results: results || [] 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Search documents error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
