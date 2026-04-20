import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Search, Bell } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  /** If true, hide the default app header (for immersive builder pages that render their own top bar). */
  bare?: boolean;
}

export function AppLayout({ children, bare }: AppLayoutProps) {
  const location = useLocation();
  const crumbs = location.pathname.split('/').filter(Boolean);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {!bare && (
            <header className="h-14 flex items-center border-b bg-card px-4 shrink-0 gap-3">
              <SidebarTrigger className="h-8 w-8" />
              <div className="flex items-center gap-1.5 text-[13px]">
                <Link to="/" className="text-muted-foreground hover:text-foreground font-medium">HireNowX</Link>
                {crumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span className={i === crumbs.length - 1 ? 'text-foreground font-semibold capitalize' : 'text-muted-foreground capitalize'}>
                      {c.replace(/-/g, ' ')}
                    </span>
                  </span>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative hidden md:flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground" />
                  <input
                    placeholder="Search jobs, candidates…"
                    className="h-8 w-64 rounded-md border border-input bg-muted/40 pl-8 pr-3 text-[13px] focus:outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
                  />
                  <span className="hnx-kbd absolute right-2">⌘K</span>
                </div>
                <button className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center relative">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal" />
                </button>
              </div>
            </header>
          )}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
