import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import { useTheme } from "@/contexts/ThemeContext";
import { useSidebar } from "@/contexts/SidebarContext";
import AIChat from "@/components/AIChat";

export default function AppLayout() {
  const { theme } = useTheme();
  const { collapsed } = useSidebar();

  // Theme B has collapsible sidebar
  const isCollapsible = theme === "B";
  const sidebarWidth = isCollapsible && collapsed ? "ml-[72px]" : "ml-64";

  return (
    <div className={`min-h-screen bg-background ${theme === "A" ? "theme-a" : "theme-b"}`}>
      <AppSidebar />
      <div className={`transition-all duration-200 ${sidebarWidth}`}>
        <TopBar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      {/* AI Chat Assistant */}
      <AIChat />
    </div>
  );
}
