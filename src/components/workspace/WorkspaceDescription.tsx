import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkspaceDescriptionProps {
  description: string | null;
}

export const WorkspaceDescription = ({ description }: WorkspaceDescriptionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">About this workspace</CardTitle>
        <CardDescription>Context for the team and shared documents.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {description?.trim()
            ? description
            : "No description yet. Add one to help collaborators understand the focus of this workspace."}
        </p>
      </CardContent>
    </Card>
  );
};
