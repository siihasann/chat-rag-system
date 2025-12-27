import { FolderOpen } from "lucide-react";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";

interface WorkspaceEmptyStateProps {
  onWorkspaceCreated: () => void;
}

export const WorkspaceEmptyState = ({
  onWorkspaceCreated,
}: WorkspaceEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
      <p className="text-muted-foreground mb-6">
        Create your first workspace to get started
      </p>
      <CreateWorkspaceDialog onWorkspaceCreated={onWorkspaceCreated} />
    </div>
  );
};
