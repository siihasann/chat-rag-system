import CreateWorkspaceDialog from "./CreateWorkspaceDialog";

interface WorkspaceHeaderProps {
  onWorkspaceCreated: () => void;
}

export const WorkspaceHeader = ({
  onWorkspaceCreated,
}: WorkspaceHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Workspaces</h2>
        <p className="text-muted-foreground">
          Organize documents and collaborate with your team
        </p>
      </div>
      <CreateWorkspaceDialog onWorkspaceCreated={onWorkspaceCreated} />
    </div>
  );
};
