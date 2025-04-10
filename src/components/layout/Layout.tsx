import Header from "@/components/layout/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { collapsed, isMobile, userPrefs } = useSidebar();
  const { wideView, largeText } = userPrefs;

  const sidebarWidth = !collapsed && !isMobile ? 240 : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className="flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <Header />
        <div
          className={cn(
            "flex-1 overflow-y-auto px-4 py-6 transition-all",
            "w-full",
            !wideView && "md:w-[80%] md:mx-auto",
            largeText ? "text-lg" : "text-base"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
