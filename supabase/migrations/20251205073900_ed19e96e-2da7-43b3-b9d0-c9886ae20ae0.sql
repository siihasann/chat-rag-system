-- Drop the existing embedding column and recreate with correct dimensions for Google embeddings (768)
ALTER TABLE public.document_chunks 
DROP COLUMN IF EXISTS embedding;

ALTER TABLE public.document_chunks 
ADD COLUMN embedding vector(768);

-- Recreate the index for vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Update the search_documents function to work with the new dimensions
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