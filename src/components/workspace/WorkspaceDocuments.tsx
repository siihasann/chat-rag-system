import DocumentList from "@/components/documents/DocumentList";
import { Document } from "@/hooks/useWorkspaceDetail";

interface WorkspaceDocumentsProps {
  documents: Document[];
  workspaceRole: string;
  onDocumentDeleted: () => void;
}

export const WorkspaceDocuments = ({
  documents,
  workspaceRole,
  onDocumentDeleted,
}: WorkspaceDocumentsProps) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Documents ({documents.length})
        </h2>
      </div>
      <DocumentList
        documents={documents}
        workspaceRole={workspaceRole}
        onDocumentDeleted={onDocumentDeleted}
      />
    </section>
  );
};
