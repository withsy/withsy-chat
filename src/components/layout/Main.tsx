import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type MainProps = {
  children: ReactNode;
};

export default function Main({ children }: MainProps) {
  const { collapsed, isMobile, userPrefs } = useSidebar();
  const { wideView, largeText } = userPrefs;
  const sidebarWidth = !collapsed && !isMobile ? 240 : 0;

  return (
    <main
      className="flex-1 transition-all duration-300"
      style={{
        marginLeft: sidebarWidth,
        height: "calc(100vh - 60px)",
      }}
    >
      <div
        className={cn(
          "px-4 py-4 transition-all h-full",
          largeText ? "text-lg" : "text-base",
          !wideView && "md:w-[80%] md:mx-auto"
        )}
      >
        {children}
      </div>
    </main>
  );
}
