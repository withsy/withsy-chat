// src/components/layout/Layout.tsx
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider } from "@/context/SidebarContext";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
