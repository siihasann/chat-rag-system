import { ReactNode, useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface WorkspaceDetailLayoutProps {
  children: ReactNode;
  workspaceName: string;
  onBack: () => void;
  headerActions?: ReactNode;
  sidebar?: ReactNode;
}

export const WorkspaceDetailLayout = ({
  children,
  workspaceName,
  onBack,
  headerActions,
  sidebar,
}: WorkspaceDetailLayoutProps) => {
  const hasSidebar = Boolean(sidebar);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isResizingRef.current) return;
      const nextWidth = startWidthRef.current + (event.clientX - startXRef.current);
      const clamped = Math.min(420, Math.max(240, Math.round(nextWidth)));
      setSidebarWidth(clamped);
    };

    const handlePointerUp = () => {
      isResizingRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    isResizingRef.current = true;
    startXRef.current = event.clientX;
    startWidthRef.current = sidebarWidth;
  };

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
    >
      {hasSidebar && (
        <Sidebar collapsible="offcanvas" variant="sidebar">
          <div className="relative flex h-full min-h-0 flex-col">
            {sidebar}
            <button
              type="button"
              onPointerDown={startResize}
              className="absolute right-0 top-0 hidden h-full w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-sidebar-border/60 md:block"
              aria-label="Resize sidebar"
            />
          </div>
        </Sidebar>
      )}
      <SidebarInset className="relative overflow-hidden text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-28 left-[-5%] h-80 w-80 rounded-full bg-muted/40 blur-3xl" />
        </div>

        <header className="fixed top-0 z-30 w-full border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="px-4">
            <div className="flex h-14 items-center gap-3">
              {hasSidebar && <SidebarTrigger className="h-8 w-8" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Workspaces</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/workspaces">Workspaces</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{workspaceName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {/* <div className="flex flex-col gap-4 pb-6 pt-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                      Workspace
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-semibold">{workspaceName}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">{headerActions}</div>
            </div> */}
          </div>
        </header>

        <main className="relative z-10 px-4 pb-8 pt-32">
          <div className="mx-auto flex max-w-6xl flex-1 flex-col gap-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
