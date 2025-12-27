import { Workspace } from "@/hooks/useWorkspaces";
import WorkspaceCard from "@/components/workspace/WorkspaceCard";

interface WorkspaceListProps {
  workspaces: Workspace[];
  onDelete: (id: string) => void;
  onMemberInvited: () => void;
}

export const WorkspaceList = ({
  workspaces,
  onDelete,
  onMemberInvited,
}: WorkspaceListProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          id={workspace.id}
          name={workspace.name}
          description={workspace.description}
          role={workspace.user_role}
          memberCount={workspace.member_count}
          onDelete={workspace.user_role === "owner" ? onDelete : undefined}
          onMemberInvited={onMemberInvited}
        />
      ))}
    </div>
  );
};
