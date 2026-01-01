import type {
  PartialUserPreferences,
  UserPreferenceKey,
} from "@/common-schemas";
import {
  Model,
  UserPreferenceValue,
  type RawUserPreferences,
} from "@repo/common";
import { useEffect, useReducer, type ActionDispatch } from "react";
import z from "zod";

const SESSION_STORAGE_NAME = "user";

const State = z.object({
  preferences: z.record(z.string(), UserPreferenceValue).optional(),
  get selectedModel() {
    return Model.optional();
  },
});
type State = z.infer<typeof State>;

type Action =
  | { type: "load" }
  | { type: "clear" }
  | { type: "setPreferences"; raw: RawUserPreferences }
  | { type: "updatePreferences"; partial: PartialUserPreferences };

function reducer(prevState: State, action: Action): State {
  const { type } = action;

  if (type === "load") {
    const stringified = sessionStorage.getItem(SESSION_STORAGE_NAME) || "{}";
    try {
      return State.parse(JSON.parse(stringified));
    } catch (_e) {
      return {};
    }
  }

  let nextState = {
    ...prevState,
  };

  if (type === "clear") {
    nextState = {};
  } else if (type === "setPreferences") {
    const { raw } = action;

    nextState.preferences = Object.fromEntries(
      Object.entries(raw).filter(([_, value]) => value !== undefined),
    );
  } else if (type === "updatePreferences") {
    const { partial } = action;

    Object.entries(partial).forEach(([key, value]) => {
      if (value === undefined) {
        delete nextState.preferences?.[key as UserPreferenceKey];
      } else {
        nextState.preferences ??= {};
        Reflect.set(nextState.preferences, key, value);
      }
    });
  } else {
    throw new Error(`Unknown action type: ${type}`);
  }

  sessionStorage.setItem(SESSION_STORAGE_NAME, JSON.stringify(nextState));

  return nextState;
}

export function useUserSessionStorage(): [State, ActionDispatch<[Action]>] {
  const [state, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    dispatch({
      type: "load",
    });
  }, [dispatch]);

  return [state, dispatch];
}
