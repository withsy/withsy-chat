import type { UserPreferenceKey } from "@/common-schemas";
import { useReducer, type ActionDispatch } from "react";

type State = Set<UserPreferenceKey>;

type Action =
  | { kind: "add"; keys: UserPreferenceKey[] }
  | { kind: "delete"; keys: UserPreferenceKey[] };

const reducer = (state: State, action: Action): State => {
  const { kind } = action;

  if (kind === "add") {
    const { keys } = action;

    keys.forEach((key) => {
      state.add(key);
    });

    return new Set(state);
  }

  if (kind === "delete") {
    const { keys } = action;

    keys.forEach((key) => {
      state.delete(key);
    });

    return new Set(state);
  }

  const _: never = kind;
  throw new Error(`Invalid action kind: ${kind}.`);
};

export type UserPreferencesPending = State;
export type DispatchUserPreferencesPending = ActionDispatch<[action: Action]>;

export function useUserPreferencesPending(): [
  data: UserPreferencesPending,
  dispatch: DispatchUserPreferencesPending,
] {
  return useReducer(reducer, null, () => {
    return new Set();
  });
}
