import { type User } from "@/types/user";
import ReturnButton from "./ReturnButton";
import LoginButton from "../login/LoginButton";

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
  user: User | null;
  size?: "default" | "sm" | "lg" | "icon";
}) {
  return user ? (
    <ReturnButton size={size} message={message} />
  ) : (
    <LoginButton size={size} message={message} />
  );
}
