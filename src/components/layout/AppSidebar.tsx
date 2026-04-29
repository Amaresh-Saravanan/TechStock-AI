import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Cpu,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Clock,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";

// Main menu items
const mainNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Sales Analytics", icon: BarChart3, path: "/sales" },
  { label: "Inventory", icon: Package, path: "/inventory" },
  { label: "Price Tracker", icon: TrendingUp, path: "/price-tracker" },
  { label: "Build Generator", icon: Cpu, path: "/build-generator" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Buy Timing", icon: Clock, path: "/buy-timing" },
  { label: "AI Advisor", icon: Lightbulb, path: "/ai-advisor" },
  { label: "Alerts", icon: Bell, path: "/alerts" },
];



const bottomItems = [
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function AppSidebar() {
  const location = useLocation();
  const { theme } = useTheme();
  const { collapsed, toggleCollapsed } = useSidebar();
  const { logout } = useAuth();

  // Theme B (light) has collapsible sidebar
  const isCollapsible = theme === "B";
  const isCollapsed = isCollapsible && collapsed;
  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-64";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out ${sidebarWidth}`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shrink-0">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight whitespace-nowrap">
              TechStock AI
            </h1>
            <p className="text-[10px] font-medium text-sidebar-foreground whitespace-nowrap">
              Inventory Intelligence
            </p>
          </div>
        )}
        {isCollapsible && (
          <button
            onClick={toggleCollapsed}
            className={`ml-auto p-1.5 rounded-md hover:bg-sidebar-accent transition-colors ${isCollapsed ? "absolute right-2" : ""}`}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
            )}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {!isCollapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground">
            Main Menu
          </p>
        )}
        {mainNavItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${isCollapsed ? "justify-center" : ""
                } ${active
                  ? theme === "A"
                    ? "bg-primary/10 text-primary shadow-glow"
                    : "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.label === "Alerts" && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      3
                    </span>
                  )}
                </>
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
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${isCollapsed ? "justify-center" : ""
              }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && item.label}
          </Link>
        ))}
        <button
          onClick={() => logout()}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive ${isCollapsed ? "justify-center" : ""
            }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
