import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/useSidebarStore";
import type { UserData } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
  className: string;
  user: UserData | null;
};

export default function ChatLayout({ children, className, user }: LayoutProps) {
  const mounted = useHasMounted();
  const { collapsed, setCollapsed, isMobile } = useSidebarStore();

  const router = useRouter();

  useEffect(() => {
    if (mounted && !user) {
      router.push("/auth/signin");
    }
  }, [mounted, user, router]);

  if (!mounted) return null; // avoid SSR mismatch

  const themeColor = user?.preferences.themeColor ?? "30,30,30";
  const themeOpacity = user?.preferences.themeOpacity ?? 0;
  const backgroundColor = `rgba(${themeColor}, ${themeOpacity})`;

  return (
    <div
      className={`flex overflow-hidden h-[100dvh] relative ${className}`}
      style={{ backgroundColor }}
    >
      <Sidebar />
      {isMobile && !collapsed && (
        <div
          className={cn(
            "fixed inset-0 bg-black/30 z-30 transition-opacity duration-300",
            collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          onClick={() => setCollapsed(true)}
        />
      )}
      <div className="flex flex-col flex-1 h-full z-20 min-w-0">
        <Main>{children}</Main>
      </div>
    </div>
  );
}
