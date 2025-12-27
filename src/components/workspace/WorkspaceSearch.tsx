import DocumentSearch from "@/components/documents/DocumentSearch";

interface WorkspaceSearchProps {
  workspaceId: string;
}

export const WorkspaceSearch = ({ workspaceId }: WorkspaceSearchProps) => {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Search Documents</h2>
      <DocumentSearch workspaceId={workspaceId} />
    </section>
  );
};
