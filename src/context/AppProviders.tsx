import type { User } from "@/types/user";
import type { ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";

export default function AppProviders({
  userMe,
  children,
}: {
  userMe: User;
  children: ReactNode;
}) {
  return <SidebarProvider userMe={userMe}>{children}</SidebarProvider>;
}
