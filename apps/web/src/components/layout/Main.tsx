import { useUserPreference } from "@/hooks/useUserPreference";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { ReactNode } from "react";

const HEADER_HEIGHT = 64;

type MainProps = {
  children: ReactNode;
};

export default function Main({ children }: MainProps) {
  const { isMobile } = useSidebarStore();
  const largeText = useUserPreference("largeText");

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
        !isMobile && "rounded-xl",
      )}
      style={mainStyle}
    >
      <div
        className={cn(
          "h-full transition-all",
          "text-base",
          largeText && "text-lg",
        )}
      >
        {children}
      </div>
    </main>
  );
}
