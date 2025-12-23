import type { UserPreferenceKey } from "@/common-schemas";
import { useUserStore } from "@/stores/useUserStore";

export function useUserPreferenceIsFetching<Key extends UserPreferenceKey>(
  key: Key,
): boolean {
  return useUserStore((s) => s.preferenceFetchingKeySet.has(key));
}
