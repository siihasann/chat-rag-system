import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Users, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import InviteMemberDialog from './InviteMemberDialog';

interface WorkspaceCardProps {
  id: string;
  name: string;
  description: string | null;
  role: string;
  memberCount: number;
  onDelete?: (id: string) => void;
  onMemberInvited: () => void;
}

const WorkspaceCard = ({ id, name, description, role, memberCount, onDelete, onMemberInvited }: WorkspaceCardProps) => {
  const navigate = useNavigate();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'member':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>
          </div>
          {role === 'owner' && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardTitle className="text-xl">{name}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex gap-2">
            {role === 'owner' && (
              <InviteMemberDialog workspaceId={id} onMemberInvited={onMemberInvited} />
            )}
            <Button size="sm" onClick={() => navigate(`/workspaces/${id}`)}>Open</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkspaceCard;