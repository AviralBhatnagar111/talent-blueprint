import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BrainCircuit, Code2, Settings,
  ChevronLeft, Layers, BarChart3, Users, Briefcase
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const mainNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Hiring Plans', url: '/hiring-plan', icon: Layers },
  { title: 'MCQ Builder', url: '/mcq-builder', icon: BrainCircuit },
  { title: 'Coding Builder', url: '/coding-builder', icon: Code2 },
];

const secondaryNav = [
  { title: 'Jobs', url: '#', icon: Briefcase },
  { title: 'Candidates', url: '#', icon: Users },
  { title: 'Reports', url: '#', icon: BarChart3 },
  { title: 'Templates', url: '#', icon: FileText },
  { title: 'Settings', url: '#', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-navy">H</span>
          </div>
          {!collapsed && (
            <div>
              <span className="text-base font-bold tracking-tight text-sidebar-primary-foreground">
                Hire<span className="text-teal">Now</span>X
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3">
            {!collapsed && 'Build'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}>
                        <item.icon className="h-4.5 w-4.5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3">
            {!collapsed && 'Manage'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors">
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-foreground">SC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-primary-foreground truncate">Sarah Chen</p>
              <p className="text-xs text-sidebar-foreground/50">Talent Lead</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
