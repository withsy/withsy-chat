import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type MainProps = {
  children: ReactNode;
};

export default function Main({ children }: MainProps) {
  const { collapsed, isMobile } = useSidebar();
  const { userPrefs } = useUser();
  const { largeText } = userPrefs;
  const sidebarWidth = !collapsed && !isMobile ? 240 : 0;
  const HEADER_HEIGHT = 64;

  const mainStyle: React.CSSProperties = {
    minHeight: `calc(90dvh - ${HEADER_HEIGHT}px)`,
    backgroundColor: "white",
    ...(isMobile
      ? {}
      : {
          borderRadius: 30,
          marginRight: 10,
          marginBottom: 10,
          marginLeft: 10 + sidebarWidth,
        }),
  };
  return (
    <main className="flex-1 transition-all duration-300" style={mainStyle}>
      <div
        className={cn(
          "transition-all h-full",
          "text-base",
          largeText && "text-lg"
        )}
      >
        {children}
      </div>
    </main>
  );
}
