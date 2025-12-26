import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  chunk_id: string;
  document_id: string;
  document_name: string;
  content: string;
  similarity: number;
}

interface DocumentSearchProps {
  workspaceId: string;
}

const DocumentSearch = ({ workspaceId }: DocumentSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-documents', {
        body: { 
          workspaceId, 
          query: query.trim(),
          matchThreshold: 0.5,
          matchCount: 5
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      
      if (data.results?.length === 0) {
        toast.info('No matching documents found');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search your documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
        />
        <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Found {results.length} relevant passages
          </h3>
          {results.map((result) => (
            <div
              key={result.chunk_id}
              className="p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{result.document_name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {Math.round(result.similarity * 100)}% match
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {result.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentSearch;
