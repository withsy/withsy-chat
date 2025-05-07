import type { UserData } from "@/types/user";
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
  user,
  size = "sm",
}: {
  message?: string;
  user: UserData | null;
  size?: "default" | "sm" | "lg" | "icon";
}) {
  return user ? (
    <ReturnButton size={size} message={message} />
  ) : (
    <LoginButton size={size} message={message} />
  );
}
