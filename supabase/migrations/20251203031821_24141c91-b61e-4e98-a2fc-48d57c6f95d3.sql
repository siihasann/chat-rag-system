-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Create documents table to track uploads
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents - based on workspace membership
CREATE POLICY "documents_select_member"
ON public.documents
FOR SELECT
USING (has_workspace_access(workspace_id, auth.uid()));

CREATE POLICY "documents_insert_member"
ON public.documents
FOR INSERT
WITH CHECK (
  has_workspace_access(workspace_id, auth.uid()) AND
  get_user_workspace_role(workspace_id, auth.uid()) IN ('owner', 'member')
);

CREATE POLICY "documents_delete_owner_or_uploader"
ON public.documents
FOR DELETE
USING (
  uploaded_by = auth.uid() OR
  is_workspace_owner(workspace_id, auth.uid())
);

-- Storage policies for documents bucket
CREATE POLICY "documents_storage_select"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND
  has_workspace_access((storage.foldername(name))[1]::uuid, auth.uid())
);

CREATE POLICY "documents_storage_insert"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  has_workspace_access((storage.foldername(name))[1]::uuid, auth.uid()) AND
  get_user_workspace_role((storage.foldername(name))[1]::uuid, auth.uid()) IN ('owner', 'member')
);

CREATE POLICY "documents_storage_delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' AND
  (
    (storage.foldername(name))[2]::uuid = auth.uid() OR
    is_workspace_owner((storage.foldername(name))[1]::uuid, auth.uid())
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for performance
CREATE INDEX idx_documents_workspace_id ON public.documents(workspace_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);