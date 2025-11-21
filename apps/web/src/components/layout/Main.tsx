import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { ReactNode } from "react";

type MainProps = {
  children: ReactNode;
};

export default function Main({ children }: MainProps) {
  const { isMobile } = useSidebarStore();
  const { user } = useUser();

  const HEADER_HEIGHT = 64;

  const mainStyle: React.CSSProperties = {
    overflow: "hidden",
    minHeight: `calc(90dvh - ${HEADER_HEIGHT}px)`,
    backgroundColor: "white",
    ...(isMobile
      ? {}
      : {
          margin: 10,
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
