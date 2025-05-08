import { useUser } from "@/context/UserContext";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
  className: string;
};

export default function ChatLayout({ children, className }: LayoutProps) {
  const mounted = useHasMounted();
  const { user, userGetStatus } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (mounted && userGetStatus === "error") {
      router.push("/auth/signin");
    }
  }, [mounted, userGetStatus, router]);

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
      <div className="flex flex-col flex-1 h-full z-20 min-w-0">
        <Main>{children}</Main>
      </div>
    </div>
  );
}
