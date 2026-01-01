import type { UserPreferenceKey } from "@/common-schemas";
import {
  Model,
  PartialUserPreferences,
  type RawUserPreferences,
} from "@repo/common";
import { useReducer } from "react";
import z from "zod";

const SESSION_STORAGE_NAME = "user";

const State = z.object({
  get preferences() {
    return PartialUserPreferences.optional();
  },
  get selectedModel() {
    return Model.optional();
  },
});
type State = z.infer<typeof State>;

type Action =
  | { type: "clear" }
  | { type: "setPreferences"; raw: RawUserPreferences }
  | { type: "updatePreferences"; partial: PartialUserPreferences };

function reducer(prevState: State, action: Action): State {
  const { type } = action;
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
        delete nextState.preferences[key as UserPreferenceKey];
      } else {
        Reflect.set(nextState.preferences, key, value);
      }
    });
  } else {
    throw new Error(`Unknown action type: ${type}`);
  }

  sessionStorage.setItem(SESSION_STORAGE_NAME, JSON.stringify(nextState));
  return nextState;
}

function init(): State {
  const stringified = sessionStorage.getItem(SESSION_STORAGE_NAME) || "{}";
  try {
    return State.parse(JSON.parse(stringified));
  } catch (_e) {
    return {};
  }
}

export function useUserSessionStorage() {
  return useReducer(reducer, undefined, init);
}
