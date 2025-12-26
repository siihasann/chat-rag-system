-- Create enum for workspace roles
CREATE TYPE public.workspace_role AS ENUM ('owner', 'member', 'viewer');

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create workspace_members table
CREATE TABLE public.workspace_members (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check workspace role
CREATE OR REPLACE FUNCTION public.get_user_workspace_role(p_workspace_id UUID, p_user_id UUID)
RETURNS public.workspace_role AS $$
  SELECT role 
  FROM public.workspace_members 
  WHERE workspace_id = p_workspace_id 
    AND user_id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- Create security definer function to check if user is workspace owner
CREATE OR REPLACE FUNCTION public.is_workspace_owner(p_workspace_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.workspaces 
    WHERE id = p_workspace_id 
      AND owner_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- Create security definer function to check workspace access
CREATE OR REPLACE FUNCTION public.has_workspace_access(p_workspace_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.workspace_members 
    WHERE workspace_id = p_workspace_id 
      AND user_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- RLS Policies for workspaces
CREATE POLICY workspaces_select_own ON public.workspaces
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    public.has_workspace_access(id, auth.uid())
  );

CREATE POLICY workspaces_insert_own ON public.workspaces
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY workspaces_update_owner ON public.workspaces
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY workspaces_delete_owner ON public.workspaces
  FOR DELETE
  USING (owner_id = auth.uid());

-- RLS Policies for workspace_members
CREATE POLICY workspace_members_select_own ON public.workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    public.is_workspace_owner(workspace_id, auth.uid())
  );

CREATE POLICY workspace_members_insert_owner ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    public.is_workspace_owner(workspace_id, auth.uid())
  );

CREATE POLICY workspace_members_update_owner ON public.workspace_members
  FOR UPDATE
  USING (public.is_workspace_owner(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

CREATE POLICY workspace_members_delete_owner ON public.workspace_members
  FOR DELETE
  USING (
    public.is_workspace_owner(workspace_id, auth.uid()) OR
    user_id = auth.uid()
  );

-- Trigger to automatically add owner as member when workspace is created
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.add_owner_as_member();

-- Trigger to update updated_at timestamp
CREATE TRIGGER handle_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);