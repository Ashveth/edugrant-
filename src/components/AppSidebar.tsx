import { GraduationCap, LayoutDashboard, User, Target, Bookmark, LogOut, PieChart, Search, FileText, ClipboardList, FileSearch, TrendingUp, ShieldAlert, Sparkles, Zap, CalendarDays, ArrowLeftRight, ScanSearch } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Profile", url: "/dashboard/profile", icon: User },
  { title: "Find Scholarships", url: "/dashboard/scholarships", icon: Search },
  { title: "Bulk Apply", url: "/dashboard/bulk-apply", icon: Zap },
  { title: "Compare", url: "/dashboard/compare", icon: ArrowLeftRight },
  { title: "Calendar", url: "/dashboard/calendar", icon: CalendarDays },
  { title: "Financial Strategy", url: "/dashboard/strategy", icon: PieChart },
  { title: "Saved", url: "/dashboard/saved", icon: Bookmark },
  { title: "Applications", url: "/dashboard/applications", icon: ClipboardList },
  { title: "My Documents", url: "/dashboard/documents", icon: FileText },
];

const aiTools = [
  { title: "Profile Analyzer", url: "/dashboard/ai/profile-analyzer", icon: FileSearch },
  { title: "Application Assistant", url: "/dashboard/ai/application-assistant", icon: FileText },
  { title: "Success Predictor", url: "/dashboard/ai/success-predictor", icon: TrendingUp },
  { title: "Scam Detector", url: "/dashboard/ai/scam-detector", icon: ShieldAlert },
];

export function AppSidebar() {
  const { logout, userEmail } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-4">
        <GraduationCap className="h-7 w-7 text-sidebar-primary" />
        <span className="font-display text-lg font-bold text-sidebar-foreground">EduGrant <span className="text-sidebar-primary">AI</span></span>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/dashboard"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> AI Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 truncate mb-2">{userEmail}</p>
        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
