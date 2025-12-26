import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const workspaceSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().trim().max(500, 'Description must be less than 500 characters').optional(),
});

interface CreateWorkspaceDialogProps {
  onWorkspaceCreated: () => void;
}

const CreateWorkspaceDialog = ({ onWorkspaceCreated }: CreateWorkspaceDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ name: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: '', description: '' });

    const validation = workspaceSchema.safeParse({ name, description });
    
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0] || '',
        description: fieldErrors.description?.[0] || '',
      });
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a workspace');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: validation.data.name,
          description: validation.data.description || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Workspace created successfully!');
      setName('');
      setDescription('');
      setOpen(false);
      onWorkspaceCreated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a workspace to organize your documents and collaborate with your team
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Marketing Team, Legal Documents"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this workspace"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceDialog;