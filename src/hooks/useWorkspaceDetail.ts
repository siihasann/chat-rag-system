import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
}

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  status: string;
}

export const useWorkspaceDetail = (workspaceId: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["workspace-detail", workspaceId, user?.id],
    enabled: !!user && !!workspaceId,
    queryFn: async () => {
      if (!user || !workspaceId) {
        return { workspace: null, documents: [], userRole: "viewer" };
      }

      // Fetch workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (workspaceError) throw workspaceError;

      // Fetch user role
      const { data: memberData } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .single();

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from("documents")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;

      return {
        workspace: workspaceData,
        documents: docsData || [],
        userRole: memberData?.role ?? "viewer",
      };
    },
  });

  useEffect(() => {
    if (!query.isError) return;

    const message =
      (query.error as { message?: string })?.message ||
      "Failed to load workspace";
    toast.error(message);
    navigate("/workspaces");
  }, [query.isError, query.error, navigate]);

  return {
    workspace: query.data?.workspace ?? null,
    documents: query.data?.documents ?? [],
    userRole: query.data?.userRole ?? "viewer",
    loading: query.isLoading,
    fetchWorkspaceData: () => query.refetch(),
  };
};
