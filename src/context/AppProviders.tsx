import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { SelectedModelProvider } from "./SelectedModelContext";
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
      refetchInterval={10 * 60} // 10 minutes
    >
      <SelectedModelProvider>
        <UserProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </UserProvider>
      </SelectedModelProvider>
    </SessionProvider>
  );
}
