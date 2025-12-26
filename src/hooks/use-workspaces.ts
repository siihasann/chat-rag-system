"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  member_count: number;
  user_role: string;
}

interface WorkspaceState {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
}

export function useWorkspaces() {
  const [state, setState] = useState<WorkspaceState>({
    workspaces: [],
    loading: true,
    error: null,
  });

  const fetchWorkspaces = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/workspaces");
      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }

      const workspaces = await response.json();
      setState({ workspaces, loading: false, error: null });
    } catch (error) {
      console.error("Fetch workspaces error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch workspaces";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
    }
  }, []);

  const createWorkspace = useCallback(
    async (name: string, description?: string) => {
      try {
        const response = await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });

        if (!response.ok) {
          throw new Error("Failed to create workspace");
        }

        const newWorkspace = await response.json();
        setState((prev) => ({
          workspaces: [...prev.workspaces, newWorkspace],
          loading: false,
          error: null,
        }));

        toast.success("Workspace created successfully");
        return newWorkspace;
      } catch (error) {
        console.error("Create workspace error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create workspace";
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const deleteWorkspace = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }

      setState((prev) => ({
        workspaces: prev.workspaces.filter((w) => w.id !== id),
        loading: false,
        error: null,
      }));

      toast.success("Workspace deleted successfully");
    } catch (error) {
      console.error("Delete workspace error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete workspace";
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return {
    workspaces: state.workspaces,
    loading: state.loading,
    error: state.error,
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
  };
}
