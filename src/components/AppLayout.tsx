import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Upload, Video, Users, BarChart3, Settings,
  Bell, Menu, X, Zap,
} from "lucide-react";
import logo from "@/assets/scoutedge-logo.png";
import { ProcessingToast } from "./ProcessingToast";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/upload", label: "Upload Match", icon: Upload },
  { to: "/matches", label: "Matches", icon: Video },
  { to: "/players", label: "Players", icon: Users },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/upload": "Upload Match",
  "/matches": "Matches",
  "/players": "Players",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const title =
    titleMap[pathname] ??
    (pathname.startsWith("/matches/") ? "Match Analysis" : "ScoutEdge");

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-card sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <img src={logo} alt="ScoutEdge" className="h-9 w-9 rounded-md object-cover" />
          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
            ScoutEdge <Zap className="h-4 w-4 text-warning fill-warning" />
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as never}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-elevated hover:text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="rounded-lg bg-elevated p-3 text-xs text-muted-foreground">
            <div className="text-foreground font-semibold mb-0.5">Pro Plan</div>
            41 / 100 hrs processed
            <div className="mt-2 h-1.5 rounded-full bg-card overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "41%" }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col">
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
              <span className="font-bold text-white flex items-center gap-1">
                ScoutEdge <Zap className="h-4 w-4 text-warning fill-warning" />
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {nav.map((item) => {
                const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to as never}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-elevated"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40 flex items-center px-4 md:px-6 gap-4">
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg md:text-xl font-bold tracking-tight">{title}</h1>

          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
              PK
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-warning/30 bg-warning/10">
              <span className="h-1.5 w-1.5 rounded-full bg-warning pulse-dot" />
              <span className="text-xs font-semibold tracking-wide text-warning">LIVE DEMO</span>
            </div>
          </div>
        </header>

        <main key={pathname} className="flex-1 p-4 md:p-6 lg:p-8 fade-in min-w-0">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden sticky bottom-0 z-40 bg-card border-t border-border grid grid-cols-5 px-1">
          {nav.slice(0, 5).map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as never}
                className={`flex flex-col items-center gap-1 py-2 text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={18} />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>

      <ProcessingToast />
    </div>
  );
}
