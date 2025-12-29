import { FileText, Upload, Eye } from "lucide-react";
import DocumentUpload from "@/components/documents/DocumentUpload";
import { WorkspaceDocuments } from "@/components/workspace/WorkspaceDocuments";
import { WorkspaceDocumentSelector } from "@/components/workspace/WorkspaceDocumentSelector";
import { WorkspaceSearch } from "@/components/workspace/WorkspaceSearch";
import { Document } from "@/hooks/useWorkspaceDetail";

interface WorkspaceSidebarProps {
  workspaceId: string;
  documents: Document[];
  userRole: string;
  selectedDocIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onUploadComplete: () => void;
  onDocumentDeleted: () => void;
}

export const WorkspaceSidebar = ({
  workspaceId,
  documents,
  userRole,
  selectedDocIds,
  onSelectionChange,
  onUploadComplete,
  onDocumentDeleted,
}: WorkspaceSidebarProps) => {
  const canUpload = userRole === "owner" || userRole === "member";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Workspace
            </p>
            <p className="text-sm font-semibold">Documents</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-6">
          {/* Upload Section */}
          {canUpload ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Upload</h3>
              </div>

              <DocumentUpload
                workspaceId={workspaceId}
                onUploadComplete={onUploadComplete}
              />
            </div>
          ) : (
            <div className="p-4 rounded-lg border-2 border-dashed border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">View-only access</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Ask an owner to upload documents
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Documents Library */}
          <WorkspaceDocuments
            documents={documents}
            workspaceRole={userRole}
            onDocumentDeleted={onDocumentDeleted}
          />

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Document Focus */}
          <WorkspaceDocumentSelector
            documents={documents}
            selectedDocIds={selectedDocIds}
            onSelectionChange={onSelectionChange}
          />

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Search */}
          <WorkspaceSearch workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
};
