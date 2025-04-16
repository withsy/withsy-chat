import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";
import { UserProvider } from "./UserContext";

export default function AppProviders({
  children,
  session,
}: {
  children: ReactNode;
  session: Session;
}) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // 5 minutes
    >
      <UserProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </UserProvider>
    </SessionProvider>
  );
}
