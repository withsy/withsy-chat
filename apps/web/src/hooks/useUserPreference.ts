import type { Preferences } from "@/common-schemas";
import { useUserSessionStore } from "@/stores/useUserSessionStore";

const DEFAULT: Preferences = {
  wideView: false,
  largeText: false,
  enterToSend: true,
  themeColor: "255,187,0",
  themeOpacity: 0.5,
  avatarStyle: "thumbs",
};

export function useUserPreference<Key extends keyof Preferences>(
  key: Key,
): Preferences[Key] {
  const value = useUserSessionStore((s) => s.preferences[key]);
  return value ?? DEFAULT[key];
}
