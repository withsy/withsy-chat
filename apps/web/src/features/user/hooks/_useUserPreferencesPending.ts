import type { UserPreferenceKey } from "@/common-schemas";
import { useMemo, useReducer, type ActionDispatch } from "react";

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

export interface UserPreferencesPending {
  data: State;
  dispatch: ActionDispatch<[action: Action]>;
}

export function useUserPreferencesPending(): UserPreferencesPending {
  const [state, dispatch] = useReducer(reducer, null, () => {
    return new Set();
  });

  return useMemo(() => {
    return {
      data: state,
      dispatch,
    };
  }, [state]);
}
