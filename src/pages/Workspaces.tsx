import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { FileText, LogOut, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import CreateWorkspaceDialog from '@/components/workspace/CreateWorkspaceDialog';
import WorkspaceCard from '@/components/workspace/WorkspaceCard';
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

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  member_count: number;
  user_role: string;
}

const Workspaces = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchWorkspaces = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch workspace memberships
      const { data: memberships, error: memberError } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          workspaces (
            id,
            name,
            description,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Get member counts for each workspace
      const workspaceIds = memberships?.map((m: any) => m.workspace_id) || [];
      
      if (workspaceIds.length === 0) {
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      const { data: memberCounts, error: countError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .in('workspace_id', workspaceIds);

      if (countError) throw countError;

      // Count members per workspace
      const counts = memberCounts?.reduce((acc: any, curr: any) => {
        acc[curr.workspace_id] = (acc[curr.workspace_id] || 0) + 1;
        return acc;
      }, {});

      // Combine data
      const workspacesData = memberships?.map((m: any) => ({
        id: m.workspaces.id,
        name: m.workspaces.name,
        description: m.workspaces.description,
        owner_id: m.workspaces.owner_id,
        created_at: m.workspaces.created_at,
        user_role: m.role,
        member_count: counts[m.workspace_id] || 0,
      })) || [];

      setWorkspaces(workspacesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!workspaceToDelete) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceToDelete);

      if (error) throw error;

      toast.success('Workspace deleted successfully');
      fetchWorkspaces();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete workspace');
    } finally {
      setDeleteDialogOpen(false);
      setWorkspaceToDelete(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">PaperChat AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">My Workspaces</h2>
              <p className="text-muted-foreground">
                Organize documents and collaborate with your team
              </p>
            </div>
            <CreateWorkspaceDialog onWorkspaceCreated={fetchWorkspaces} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No workspaces yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first workspace to get started
              </p>
              <CreateWorkspaceDialog onWorkspaceCreated={fetchWorkspaces} />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  id={workspace.id}
                  name={workspace.name}
                  description={workspace.description}
                  role={workspace.user_role}
                  memberCount={workspace.member_count}
                  onDelete={workspace.user_role === 'owner' ? handleDeleteWorkspace : undefined}
                  onMemberInvited={fetchWorkspaces}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workspace and all its data. This action cannot be undone.
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
    </div>
  );
};

export default Workspaces;