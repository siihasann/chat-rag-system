import { ReactNode } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "../ui/button";

interface WorkspaceDetailLayoutProps {
  children: ReactNode;
  workspaceName: string;
  onBack: () => void;
  headerActions?: ReactNode;
}

export const WorkspaceDetailLayout = ({
  children,
  workspaceName,
  onBack,
  headerActions,
}: WorkspaceDetailLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{workspaceName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">{headerActions}</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
};
