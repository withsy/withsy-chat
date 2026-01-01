import type { UserPreferenceKey } from "@/common-schemas";
import { useUserContext } from "../contexts/UserContext";

export function useUserPreferenceIsPending<Key extends UserPreferenceKey>(
  key: Key,
): boolean {
  const userContext = useUserContext();
  const { preferencePending } = userContext;

  return preferencePending.data.has(key);
}
