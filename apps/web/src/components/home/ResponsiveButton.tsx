import { useSession } from "next-auth/react";
import LoginButton from "../login/LoginButton";
import ReturnButton from "./ReturnButton";

/**
 * Shows either “Return to chat” (when the user is logged-in)
 * or “Start Chatting” (when the user is logged-out).
 *
 * Usage:
 *   <ResponsiveButton user={user} size="sm" />
 */
export default function ResponsiveButton({
  message,
  size = "sm",
}: {
  message?: string;
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const { status } = useSession();

  return status === "authenticated" ? (
    <ReturnButton size={size} message={message} />
  ) : (
    <LoginButton size={size} message={message} />
  );
}
