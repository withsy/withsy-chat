import type { Preferences } from "@/common-schemas";
import { useUserSessionStorageStore } from "@/stores/useUserSessionStorageStore";

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
  const value = useUserSessionStorageStore((s) => s.preferences[key]);
  return value ?? DEFAULT[key];
}
