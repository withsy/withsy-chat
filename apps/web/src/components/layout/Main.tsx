import { useUserPreference } from "@/features/user/hooks/useUserPreference";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PartialError } from "../Error";

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
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={PartialError}>
          <main
            className={cn(
              "z-20 flex h-full min-w-0 flex-1 flex-col transition-all duration-300",
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
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
