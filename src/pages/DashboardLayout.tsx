import { Outlet, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GraduationCap } from "lucide-react";

export default function DashboardLayout() {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-accent" />
              <span className="font-display text-sm font-semibold text-foreground">EduGrant AI</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
