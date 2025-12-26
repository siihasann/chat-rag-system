import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  role: z.enum(['owner', 'member', 'viewer']),
});

interface InviteMemberDialogProps {
  workspaceId: string;
  onMemberInvited: () => void;
}

const InviteMemberDialog = ({ workspaceId, onMemberInvited }: InviteMemberDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'member' | 'viewer'>('viewer');
  const [errors, setErrors] = useState({ email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: '' });

    const validation = inviteSchema.safeParse({ email, role });
    
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || '',
      });
      return;
    }

    if (!user) {
      toast.error('You must be logged in to invite members');
      return;
    }

    setLoading(true);

    try {
      // First, find the user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', validation.data.email)
        .single();

      if (profileError || !profiles) {
        toast.error('User with this email not found. They must sign up first.');
        setLoading(false);
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', profiles.id)
        .single();

      if (existingMember) {
        toast.error('This user is already a member of this workspace');
        setLoading(false);
        return;
      }

      // Add as member
      const { error: insertError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: profiles.id,
          role: validation.data.role,
          invited_by: user.id,
        });

      if (insertError) throw insertError;

      toast.success(`Successfully invited ${validation.data.email} as ${validation.data.role}`);
      setEmail('');
      setRole('viewer');
      setOpen(false);
      onMemberInvited();
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite someone to collaborate in this workspace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
            <p className="text-xs text-muted-foreground">
              User must have an account to be invited
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner - Full access including deletion</SelectItem>
                <SelectItem value="member">Member - Can edit and manage content</SelectItem>
                <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;