import type { TrpcOptions } from "@/lib/trpc";
import { useUserPreferencesStore } from "@/stores/useUserPreferencesStore";
import type { inferInput } from "@trpc/tanstack-react-query";

type Preferences = Required<
  inferInput<TrpcOptions["user"]["updatePreferences"]>
>;

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
  return useUserPreferencesStore((s) => s.getByKey(key)) ?? DEFAULT[key];
}
