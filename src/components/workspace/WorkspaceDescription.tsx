interface WorkspaceDescriptionProps {
  description: string | null;
}

export const WorkspaceDescription = ({
  description,
}: WorkspaceDescriptionProps) => {
  if (!description) return null;

  return <p className="text-muted-foreground">{description}</p>;
};
