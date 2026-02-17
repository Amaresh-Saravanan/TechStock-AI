import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Brain,
  Cpu,
  BarChart3,
  Bell,
  Shield,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Inventory", icon: Package, path: "/inventory" },
  { label: "Price Tracker", icon: TrendingUp, path: "/price-tracker" },
  { label: "AI Predictions", icon: Brain, path: "/predictions" },
  { label: "Build Generator", icon: Cpu, path: "/build-generator" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Alerts", icon: Bell, path: "/alerts" },
  { label: "Admin Panel", icon: Shield, path: "/admin" },
];

const bottomItems = [
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">TechStock AI</h1>
          <p className="text-[10px] font-medium text-sidebar-foreground">Inventory Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground">
          Main Menu
        </p>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary/10 text-primary shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 ${active ? 'text-primary' : ''}`} />
              {item.label}
              {item.label === 'Alerts' && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border px-3 py-3">
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <Link
          to="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
