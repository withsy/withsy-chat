import Header from "@/components/layout/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { collapsed, isMobile } = useSidebar();

  const sidebarWidth = !collapsed && !isMobile ? 240 : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <Header />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
