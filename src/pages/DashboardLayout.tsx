import { Outlet, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GraduationCap, Moon, Sun, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIChatbot from "@/components/AIChatbot";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export default function DashboardLayout() {
  const { isLoggedIn, darkMode, toggleDarkMode } = useApp();
  const { canInstall, isInstalled, install } = usePwaInstall();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header — sticky, consistent height */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/60 bg-card/80 backdrop-blur-xl px-4 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-display text-sm font-semibold text-foreground tracking-tight">EduGrant AI</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canInstall && (
                <Button variant="outline" size="sm" onClick={install} className="h-8 gap-1.5 rounded-xl text-xs font-medium border-border/60">
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Install App</span>
                </Button>
              )}
              {isInstalled && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-accent" />
                  Installed
                </span>
              )}
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-8 w-8 rounded-xl">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>
          {/* Main content — consistent padding, max-width centered */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <AIChatbot />
    </SidebarProvider>
  );
}
