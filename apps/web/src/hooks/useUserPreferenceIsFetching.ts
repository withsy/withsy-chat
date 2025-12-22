import { useUser } from "@/context/UserContext";
import type { UserPreferenceKey } from "./useUpdateUserPreferences";

export function useUserPreferenceIsFetching<Key extends UserPreferenceKey>(
  key: Key,
): boolean {
  const user = useUser();
  if (!user) {
    return false;
  }

  const { preferenceIsFetchingSet } = user;
  return preferenceIsFetchingSet.has(key);
}
