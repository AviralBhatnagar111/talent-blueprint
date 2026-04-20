import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, BarChart3, FileText, Settings, Sparkles,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const mainNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Jobs', url: '/jobs', icon: Briefcase },
  { title: 'Candidates', url: '/candidates', icon: Users },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
];

const secondaryNav = [
  { title: 'Templates', url: '/templates', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const isActive = (url: string) => url === '/' ? location.pathname === '/' : location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shrink-0 shadow-teal-glow">
            <Sparkles className="w-4 h-4 text-navy" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="leading-none">
              <span className="text-[15px] font-bold tracking-tight text-sidebar-primary-foreground">
                Hire<span className="text-teal">Now</span>X
              </span>
              <p className="text-[10px] text-sidebar-foreground/60 mt-0.5 uppercase tracking-wider">Talent Intelligence</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3 font-semibold">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        to={item.url}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all',
                          active
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
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
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider px-3 font-semibold mt-2">
              Library
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground transition-all">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center ring-2 ring-sidebar-accent">
              <span className="text-[11px] font-bold text-primary-foreground">SC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-sidebar-primary-foreground truncate leading-tight">Sarah Chen</p>
              <p className="text-[10px] text-sidebar-foreground/50">Talent Lead</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center mx-auto">
            <span className="text-[11px] font-bold text-primary-foreground">SC</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
