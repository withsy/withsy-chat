import type { UserPreferenceKey, UserPreferences } from "@/common-schemas";
import { useUserContext } from "../contexts/UserContext";
import { DEFAULT_USER_PREFERENCES } from "./useUserSessionStorage";

export function useUserPreference<Key extends UserPreferenceKey>(
  key: Key,
): UserPreferences[Key] {
  const userContext = useUserContext();
  const { sessionStorage } = userContext;
  const { preferences } = sessionStorage.data;

  return preferences?.[key] ?? DEFAULT_USER_PREFERENCES[key];
}
