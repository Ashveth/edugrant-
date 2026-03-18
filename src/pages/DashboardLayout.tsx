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

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between gap-3 border-b border-border/60 bg-card/80 backdrop-blur-md px-5">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-display text-sm font-semibold text-foreground tracking-tight">EduGrant AI</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-8 w-8 rounded-xl">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="flex-1 overflow-auto bg-background p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <AIChatbot />
    </SidebarProvider>
  );
}
