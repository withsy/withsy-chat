// src/components/layout/Layout.tsx
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { collapsed, isMobile } = useSidebar();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main
          className={cn(
            "bg-gray-50 p-6 h-[calc(100vh-60px)] overflow-auto",
            !isMobile && !collapsed && " pl-[240px] ml-6"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
