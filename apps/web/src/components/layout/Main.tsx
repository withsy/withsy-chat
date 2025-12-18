import { usePreferences } from "@/context/PreferencesContext";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { ReactNode } from "react";

const HEADER_HEIGHT = 64;

type MainProps = {
  children: ReactNode;
};

export default function Main({ children }: MainProps) {
  const { isMobile } = useSidebarStore();
  const { usePreference } = usePreferences();
  const largeText = usePreference("largeText");

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
          largeText && "text-lg"
        )}
      >
        {children}
      </div>
    </main>
  );
}
