import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, MoreVertical, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
  status: string;
}

interface DocumentListProps {
  documents: Document[];
  workspaceRole: string;
  onDocumentDeleted: () => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (mimeType: string) => {
  return FileText;
};

const DocumentList = ({ documents, workspaceRole, onDocumentDeleted }: DocumentListProps) => {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.message || 'Failed to download document');
    }
  };

  const handleDelete = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([documentToDelete.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (dbError) throw dbError;

      toast.success('Document deleted');
      onDocumentDeleted();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const canDelete = (document: Document) => {
    return workspaceRole === 'owner' || document.uploaded_by === user?.id;
  };

  const handleReprocess = async (document: Document) => {
    setReprocessingId(document.id);
    try {
      await supabase.functions.invoke('process-document', {
        body: { documentId: document.id }
      });
      toast.success('Document queued for reprocessing');
      onDocumentDeleted(); // Refresh list
    } catch (error) {
      toast.error('Failed to reprocess document');
    } finally {
      setReprocessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No documents yet</p>
        <p className="text-sm">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border">
        {documents.map((doc) => {
          const Icon = getFileIcon(doc.mime_type);
          return (
            <div
              key={doc.id}
              className="flex items-center gap-4 py-3 hover:bg-muted/50 px-3 -mx-3 rounded-lg transition-colors"
            >
              <Icon className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{doc.name}</p>
                  {getStatusBadge(doc.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  {(doc.status === 'failed' || doc.status === 'pending') && (
                    <DropdownMenuItem 
                      onClick={() => handleReprocess(doc)}
                      disabled={reprocessingId === doc.id}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${reprocessingId === doc.id ? 'animate-spin' : ''}`} />
                      Reprocess
                    </DropdownMenuItem>
                  )}
                  {canDelete(doc) && (
                    <DropdownMenuItem
                      onClick={() => handleDelete(doc)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentList;
