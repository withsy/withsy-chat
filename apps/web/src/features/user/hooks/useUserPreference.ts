import type { UserPreferenceKey } from "@/common-schemas";
import type { UserPreferences } from "@repo/common";
import { useUserContext } from "../contexts/UserContext";

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  wideView: false,
  largeText: false,
  enterToSend: true,
  themeColor: "255,187,0",
  themeOpacity: 0.5,
  avatarStyle: "thumbs",
};

export function useUserPreference<Key extends UserPreferenceKey>(
  key: UserPreferenceKey,
): UserPreferences[Key] {
  const userContext = useUserContext();
  const { userSessionStorage } = userContext;
  const { preferences } = userSessionStorage;

  // TODO: check memo
  return preferences[key] ?? DEFAULT_USER_PREFERENCES[key];
}
