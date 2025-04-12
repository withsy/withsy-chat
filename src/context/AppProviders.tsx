import { trpc, type UserMe } from "@/lib/trpc";
import type { ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";

export default function AppProviders({
  userMe,
  children,
}: {
  userMe: UserMe;
  children: ReactNode;
}) {
  return <SidebarProvider userMe={userMe}>{children}</SidebarProvider>;
}
