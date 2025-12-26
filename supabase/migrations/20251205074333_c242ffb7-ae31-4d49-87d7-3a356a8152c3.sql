-- Drop the conflicting function with vector type parameter
DROP FUNCTION IF EXISTS public.search_documents(uuid, vector, double precision, integer);

-- Recreate only the text-based function
DROP FUNCTION IF EXISTS public.search_documents(uuid, text, double precision, integer);

CREATE OR REPLACE FUNCTION public.search_documents(
  p_workspace_id UUID,
  p_embedding TEXT,
  p_match_threshold FLOAT DEFAULT 0.5,
  p_match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_name TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id as chunk_id,
    dc.document_id,
    d.name as document_name,
    dc.content,
    1 - (dc.embedding <=> p_embedding::vector) as similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE dc.workspace_id = p_workspace_id
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> p_embedding::vector) > p_match_threshold
  ORDER BY dc.embedding <=> p_embedding::vector
  LIMIT p_match_count;
END;
$$;