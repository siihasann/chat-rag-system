import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceList } from "@/components/workspace/WorkspaceList";
import { WorkspaceEmptyState } from "@/components/workspace/WorkspaceEmptyState";
import { WorkspaceLoadingState } from "@/components/workspace/WorkspaceLoadingState";
import { DeleteWorkspaceDialog } from "@/components/workspace/DeleteWorkspaceDialog";

const Workspaces = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { workspaces, loading, fetchWorkspaces, deleteWorkspace } =
    useWorkspaces();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;

    const success = await deleteWorkspace(workspaceToDelete);

    if (success) {
      setDeleteDialogOpen(false);
      setWorkspaceToDelete(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceLayout>
      <WorkspaceHeader onWorkspaceCreated={fetchWorkspaces} />

      {loading ? (
        <WorkspaceLoadingState />
      ) : workspaces.length === 0 ? (
        <WorkspaceEmptyState onWorkspaceCreated={fetchWorkspaces} />
      ) : (
        <WorkspaceList
          workspaces={workspaces}
          onDelete={handleDeleteWorkspace}
          onMemberInvited={fetchWorkspaces}
        />
      )}

      <DeleteWorkspaceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </WorkspaceLayout>
  );
};

export default Workspaces;
