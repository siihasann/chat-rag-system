import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  member_count: number;
  user_role: string;
}

export const useWorkspaces = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["workspaces", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // Fetch workspace memberships
      const { data: memberships, error: memberError } = await supabase
        .from("workspace_members")
        .select(
          `
          workspace_id,
          role,
          workspaces (
            id,
            name,
            description,
            owner_id,
            created_at
          )
        `
        )
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      // Get member counts for each workspace
      const workspaceIds = memberships?.map((m: any) => m.workspace_id) || [];

      if (workspaceIds.length === 0) {
        return [];
      }

      const { data: memberCounts, error: countError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .in("workspace_id", workspaceIds);

      if (countError) throw countError;

      // Count members per workspace
      const counts = memberCounts?.reduce((acc: any, curr: any) => {
        acc[curr.workspace_id] = (acc[curr.workspace_id] || 0) + 1;
        return acc;
      }, {});

      // Combine data
      return (
        memberships?.map((m: any) => ({
          id: m.workspaces.id,
          name: m.workspaces.name,
          description: m.workspaces.description,
          owner_id: m.workspaces.owner_id,
          created_at: m.workspaces.created_at,
          user_role: m.role,
          member_count: counts[m.workspace_id] || 0,
        })) || []
      );
    },
  });

  useEffect(() => {
    if (!query.isError) return;
    const message =
      (query.error as { message?: string })?.message ||
      "Failed to fetch workspaces";
    toast.error(message);
  }, [query.isError, query.error]);

  const deleteWorkspace = async (id: string) => {
    try {
      const { error } = await supabase.from("workspaces").delete().eq("id", id);

      if (error) throw error;

      toast.success("Workspace deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["workspaces", user?.id] });
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete workspace");
      return false;
    }
  };

  return {
    workspaces: query.data ?? [],
    loading: query.isLoading,
    fetchWorkspaces: () => query.refetch(),
    deleteWorkspace,
  };
};
