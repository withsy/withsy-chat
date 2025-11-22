import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
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
      refetchInterval={18 * 60 * 60} // 18 hours
    >
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}
