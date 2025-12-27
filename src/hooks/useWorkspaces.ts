import { useState, useEffect } from "react";
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) return;

    try {
      setLoading(true);

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
        setWorkspaces([]);
        setLoading(false);
        return;
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
      const workspacesData =
        memberships?.map((m: any) => ({
          id: m.workspaces.id,
          name: m.workspaces.name,
          description: m.workspaces.description,
          owner_id: m.workspaces.owner_id,
          created_at: m.workspaces.created_at,
          user_role: m.role,
          member_count: counts[m.workspace_id] || 0,
        })) || [];

      setWorkspaces(workspacesData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (id: string) => {
    try {
      const { error } = await supabase.from("workspaces").delete().eq("id", id);

      if (error) throw error;

      toast.success("Workspace deleted successfully");
      fetchWorkspaces();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete workspace");
      return false;
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  return {
    workspaces,
    loading,
    fetchWorkspaces,
    deleteWorkspace,
  };
};
