import type { User } from "@/types/user";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";

export default function AppProviders({
  userMe,
  children,
  session,
}: {
  userMe: User;
  children: ReactNode;
  session: Session;
}) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // 5 minutes
    >
      <SidebarProvider userMe={userMe}>{children}</SidebarProvider>
    </SessionProvider>
  );
}
