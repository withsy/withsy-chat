import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

type LayoutProps = {
  children: ReactNode;
};
export default function Layout({ children }: LayoutProps) {
  const { collapsed, isMobile } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 max-h-screen">
        <Header />
        <div
          className={cn(
            "flex-1 overflow-y-auto",
            !isMobile && !collapsed && "pl-[240px] ml-6"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
