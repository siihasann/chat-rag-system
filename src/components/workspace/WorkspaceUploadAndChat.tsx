import { cn } from "@/lib/utils";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentChat from "@/components/documents/DocumentChat";
import { Document } from "@/hooks/useWorkspaceDetail";

interface WorkspaceUploadAndChatProps {
  workspaceId: string;
  documents: Document[];
  userRole: string;
  onUploadComplete: () => void;
}

export const WorkspaceUploadAndChat = ({
  workspaceId,
  documents,
  userRole,
  onUploadComplete,
}: WorkspaceUploadAndChatProps) => {
  const canUpload = userRole === "owner" || userRole === "member";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {canUpload && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Upload Documents</h2>
          <DocumentUpload
            workspaceId={workspaceId}
            onUploadComplete={onUploadComplete}
          />
        </section>
      )}

      <section className={cn("space-y-3", !canUpload && "lg:col-span-2")}>
        <h2 className="text-base font-semibold">Chat with AI</h2>
        <DocumentChat workspaceId={workspaceId} documents={documents} />
      </section>
    </div>
  );
};
