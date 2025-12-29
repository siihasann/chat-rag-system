import { useState } from "react";
import { Search } from "lucide-react";

interface WorkspaceSearchProps {
  workspaceId: string;
}

export const WorkspaceSearch = ({ workspaceId }: WorkspaceSearchProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Implement your search logic here
      console.log("Searching for:", query);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Search</h3>
      </div>

      <p className="text-xs text-muted-foreground">
        Find relevant passages across all files
      </p>

      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </form>

      {query && (
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Press Enter to search for "{query}"
          </p>
        </div>
      )}
    </div>
  );
};
