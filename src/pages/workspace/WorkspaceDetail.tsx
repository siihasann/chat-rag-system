// src/pages/WorkspaceDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useWorkspaceDetail } from "@/hooks/useWorkspaceDetail";
import { WorkspaceDetailLayout } from "@/components/workspace/WorkspaceDetailLayout";
import { WorkspaceDescription } from "@/components/workspace/WorkspaceDescription";
import { WorkspaceUploadAndChat } from "@/components/workspace/WorkspaceUploadAndChat";
import { WorkspaceSearch } from "@/components/workspace/WorkspaceSearch";
import { WorkspaceDocuments } from "@/components/workspace/WorkspaceDocuments";
import { WorkspaceLoadingState } from "@/components/workspace/WorkspaceLoadingState";
import InviteMemberDialog from "@/components/workspace/InviteMemberDialog";
import { useEffect } from "react";

const WorkspaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { workspace, documents, userRole, loading, fetchWorkspaceData } =
    useWorkspaceDetail(id || "");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return <WorkspaceLoadingState />;
  }

  const handleBack = () => {
    navigate("/workspaces");
  };

  const headerActions =
    userRole === "owner" && workspace ? (
      <InviteMemberDialog
        workspaceId={workspace.id}
        onMemberInvited={fetchWorkspaceData}
      />
    ) : null;

  return (
    <WorkspaceDetailLayout
      workspaceName={workspace?.name || "Workspace"}
      onBack={handleBack}
      headerActions={headerActions}
    >
      {loading || !workspace ? (
        <WorkspaceLoadingState />
      ) : (
        <>
          <WorkspaceDescription description={workspace.description} />

          <WorkspaceUploadAndChat
            workspaceId={workspace.id}
            documents={documents}
            userRole={userRole}
            onUploadComplete={fetchWorkspaceData}
          />

          <WorkspaceSearch workspaceId={workspace.id} />

          <WorkspaceDocuments
            documents={documents}
            workspaceRole={userRole}
            onDocumentDeleted={fetchWorkspaceData}
          />
        </>
      )}
    </WorkspaceDetailLayout>
  );
};

export default WorkspaceDetail;
