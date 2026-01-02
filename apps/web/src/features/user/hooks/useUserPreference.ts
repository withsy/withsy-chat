import type { UserPreferenceKey, UserPreferences } from "@/common-schemas";
import { useUserContext } from "../contexts/UserContext";
import { DEFAULT_USER_PREFERENCES } from "./_useUserSessionStorage";

export function useUserPreference<Key extends UserPreferenceKey>(
  key: Key,
): UserPreferences[Key] {
  const userContext = useUserContext();
  const { userSessionStorage } = userContext;

  return userSessionStorage.preferences?.[key] ?? DEFAULT_USER_PREFERENCES[key];
}
