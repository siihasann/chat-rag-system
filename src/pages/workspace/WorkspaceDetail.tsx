// src/pages/WorkspaceDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, ShieldCheck, Timer } from "lucide-react";
import { useWorkspaceDetail } from "@/hooks/useWorkspaceDetail";
import { WorkspaceDetailLayout } from "@/components/workspace/WorkspaceDetailLayout";
import { WorkspaceDescription } from "@/components/workspace/WorkspaceDescription";
import { WorkspaceUploadAndChat } from "@/components/workspace/WorkspaceUploadAndChat";
import { WorkspaceLoadingState } from "@/components/workspace/WorkspaceLoadingState";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import InviteMemberDialog from "@/components/workspace/InviteMemberDialog";
import { useEffect, useState } from "react";

const WorkspaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { workspace, documents, userRole, loading, fetchWorkspaceData } =
    useWorkspaceDetail(id || "");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const readyIds = new Set(
      documents
        .filter((doc) => doc.status === "ready" || doc.status === "completed")
        .map((doc) => doc.id),
    );
    setSelectedDocIds((prev) => prev.filter((id) => readyIds.has(id)));
  }, [documents]);

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

  const totalStorage = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
  const latestDocument = documents[0];
  const roleLabel = userRole === "owner" ? "Owner" : userRole === "member" ? "Member" : "Viewer";

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "No uploads yet";
    return new Date(value).toLocaleDateString();
  };

  return (
    <WorkspaceDetailLayout
      workspaceName={workspace?.name || "Workspace"}
      onBack={handleBack}
      headerActions={headerActions}
      sidebar={
        workspace ? (
          <WorkspaceSidebar
            workspaceId={workspace.id}
            documents={documents}
            userRole={userRole}
            selectedDocIds={selectedDocIds}
            onSelectionChange={setSelectedDocIds}
            onUploadComplete={fetchWorkspaceData}
            onDocumentDeleted={fetchWorkspaceData}
          />
        ) : null
      }
    >
      {loading || !workspace ? (
        <WorkspaceLoadingState />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Workspace overview</CardTitle>
                  <CardDescription>
                    A quick snapshot of activity and access for this workspace.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  {roleLabel} access
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HardDrive className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatBytes(totalStorage)}</p>
                    <p className="text-xs text-muted-foreground">Storage used</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{documents.length} documents</p>
                    <p className="text-xs text-muted-foreground">Files in the library</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Timer className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatDate(latestDocument?.created_at)}</p>
                    <p className="text-xs text-muted-foreground">Latest upload</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <WorkspaceDescription description={workspace.description} />

          <WorkspaceUploadAndChat
            workspaceId={workspace.id}
            documents={documents}
            selectedDocIds={selectedDocIds}
          />
        </>
      )}
    </WorkspaceDetailLayout>
  );
};

export default WorkspaceDetail;
