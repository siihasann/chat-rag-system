import { useState } from "react";
import { FolderOpen } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);
  const displayLimit = 4;
  const shouldShowToggle = documents.length > displayLimit;
  const displayDocs = expanded ? documents : documents.slice(0, displayLimit);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Library</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {documents.length}
        </span>
      </div>

      {/* Tanpa border wrapper, langsung tampilkan DocumentList */}
      <DocumentList
        documents={displayDocs}
        workspaceRole={workspaceRole}
        onDocumentDeleted={onDocumentDeleted}
      />

      {shouldShowToggle && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {expanded
            ? "Show less"
            : `Show ${documents.length - displayLimit} more`}
        </button>
      )}
    </div>
  );
};
