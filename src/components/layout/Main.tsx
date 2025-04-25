import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { ReactNode } from "react";

type MainProps = {
  children: ReactNode;
};

export default function Main({ children }: MainProps) {
  const { collapsed, isMobile } = useSidebarStore();
  const { user } = useUser();

  const sidebarWidth = !collapsed && !isMobile ? 240 : 0;
  const HEADER_HEIGHT = 64;

  const mainStyle: React.CSSProperties = {
    overflow: "hidden",
    minHeight: `calc(90dvh - ${HEADER_HEIGHT}px)`,
    backgroundColor: "white",
    ...(isMobile
      ? {}
      : {
          marginTop: 10,
          marginRight: 10,
          marginBottom: 10,
          marginLeft: 10 + sidebarWidth,
        }),
  };
  return (
    <main
      className={cn(
        `flex-1 transition-all duration-300`,
        !isMobile && "rounded-xl"
      )}
      style={mainStyle}
    >
      <div
        className={cn(
          "transition-all h-full",
          "text-base",
          user?.preferences.largeText && "text-lg"
        )}
      >
        {children}
      </div>
    </main>
  );
}
