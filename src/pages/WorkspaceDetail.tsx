import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import DocumentSearch from '@/components/documents/DocumentSearch';
import DocumentChat from '@/components/documents/DocumentChat';
import InviteMemberDialog from '@/components/workspace/InviteMemberDialog';

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
}

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

const WorkspaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchWorkspaceData = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);

      // Fetch workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', id)
        .single();

      if (workspaceError) throw workspaceError;
      setWorkspace(workspaceData);

      // Fetch user role
      const { data: memberData } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', id)
        .eq('user_id', user.id)
        .single();

      if (memberData) {
        setUserRole(memberData.role);
      }

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('workspace_id', id)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load workspace');
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [user, id]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  const canUpload = userRole === 'owner' || userRole === 'member';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/workspaces')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{workspace.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userRole === 'owner' && (
              <InviteMemberDialog workspaceId={workspace.id} onMemberInvited={fetchWorkspaceData} />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {workspace.description && (
            <p className="text-muted-foreground">{workspace.description}</p>
          )}

          {/* Two-column layout for upload and chat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {canUpload && (
              <section className="space-y-3">
                <h2 className="text-base font-semibold">Upload Documents</h2>
                <DocumentUpload workspaceId={workspace.id} onUploadComplete={fetchWorkspaceData} />
              </section>
            )}

            <section className={cn("space-y-3", !canUpload && "lg:col-span-2")}>
              <h2 className="text-base font-semibold">Chat with AI</h2>
              <DocumentChat workspaceId={workspace.id} documents={documents} />
            </section>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">Search Documents</h2>
            <DocumentSearch workspaceId={workspace.id} />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Documents ({documents.length})</h2>
            </div>
            <DocumentList
              documents={documents}
              workspaceRole={userRole}
              onDocumentDeleted={fetchWorkspaceData}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceDetail;
