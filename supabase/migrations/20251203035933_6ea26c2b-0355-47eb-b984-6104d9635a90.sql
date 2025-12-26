-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add processing status to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Create document_chunks table for storing text chunks with embeddings
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_chunks - based on workspace membership
CREATE POLICY "document_chunks_select_member"
ON public.document_chunks
FOR SELECT
USING (has_workspace_access(workspace_id, auth.uid()));

CREATE POLICY "document_chunks_insert_service"
ON public.document_chunks
FOR INSERT
WITH CHECK (has_workspace_access(workspace_id, auth.uid()));

CREATE POLICY "document_chunks_delete_owner"
ON public.document_chunks
FOR DELETE
USING (is_workspace_owner(workspace_id, auth.uid()));

-- Create function for semantic search
CREATE OR REPLACE FUNCTION public.search_documents(
  p_workspace_id UUID,
  p_embedding vector(1536),
  p_match_threshold FLOAT DEFAULT 0.7,
  p_match_count INT DEFAULT 5
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
    dc.id AS chunk_id,
    dc.document_id,
    d.name AS document_name,
    dc.content,
    1 - (dc.embedding <=> p_embedding) AS similarity
  FROM public.document_chunks dc
  JOIN public.documents d ON d.id = dc.document_id
  WHERE dc.workspace_id = p_workspace_id
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> p_embedding) > p_match_threshold
  ORDER BY dc.embedding <=> p_embedding
  LIMIT p_match_count;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX idx_document_chunks_workspace_id ON public.document_chunks(workspace_id);
CREATE INDEX idx_document_chunks_embedding ON public.document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_documents_status ON public.documents(status);