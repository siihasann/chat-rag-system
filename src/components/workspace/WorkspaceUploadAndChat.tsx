import DocumentChat from "@/components/documents/DocumentChat";
import { Document } from "@/hooks/useWorkspaceDetail";

interface WorkspaceUploadAndChatProps {
  workspaceId: string;
  documents: Document[];
  selectedDocIds: string[];
}

export const WorkspaceUploadAndChat = ({
  workspaceId,
  documents,
  selectedDocIds,
}: WorkspaceUploadAndChatProps) => {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold">Chat with AI</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions across your uploaded content in real time.
        </p>
      </div>
      <DocumentChat
        workspaceId={workspaceId}
        documents={documents}
        selectedDocIds={selectedDocIds}
      />
    </section>
  );
};
