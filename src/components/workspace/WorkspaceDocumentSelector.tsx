import { Check } from "lucide-react";

interface DocumentSummary {
  id: string;
  name: string;
  status: string;
}

interface WorkspaceDocumentSelectorProps {
  documents: DocumentSummary[];
  selectedDocIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const WorkspaceDocumentSelector = ({
  documents,
  selectedDocIds,
  onSelectionChange,
}: WorkspaceDocumentSelectorProps) => {
  const readyDocuments = documents.filter(
    (doc) => doc.status === "ready" || doc.status === "completed"
  );

  const toggleDocument = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      onSelectionChange(selectedDocIds.filter((id) => id !== docId));
    } else {
      onSelectionChange([...selectedDocIds, docId]);
    }
  };

  const selectAll = () =>
    onSelectionChange(readyDocuments.map((doc) => doc.id));
  const clearSelection = () => onSelectionChange([]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Focus</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedDocIds.length || "All"}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Choose specific files to scope the AI chat
      </p>

      <div className="flex gap-2">
        <button
          onClick={selectAll}
          disabled={readyDocuments.length === 0}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Select all
        </button>
        <button
          onClick={clearSelection}
          disabled={selectedDocIds.length === 0}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      </div>

      {readyDocuments.length === 0 ? (
        <div className="p-4 text-center rounded-lg border-2 border-dashed border-border">
          <p className="text-xs text-muted-foreground">
            No processed documents yet. Upload files and wait for processing.
          </p>
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {readyDocuments.map((doc) => (
            <label
              key={doc.id}
              className={`
                flex items-center gap-2.5 p-2 rounded-md cursor-pointer transition-colors
                ${
                  selectedDocIds.includes(doc.id)
                    ? "bg-primary/10 border border-primary/40"
                    : "hover:bg-muted/50"
                }
              `}
            >
              <input
                type="checkbox"
                checked={selectedDocIds.includes(doc.id)}
                onChange={() => toggleDocument(doc.id)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm truncate flex-1">{doc.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
