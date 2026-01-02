import type {
  PartialUserPreferences,
  UserPreferenceKey,
  UserPreferences,
} from "@/common-schemas";
import { Model, RawUserPreferences } from "@repo/common";
import { useEffect, useReducer, type ActionDispatch } from "react";
import z from "zod";

const SESSION_STORAGE_NAME = "user";

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  wideView: false,
  largeText: false,
  enterToSend: true,
  themeColor: "255,187,0",
  themeOpacity: 0.5,
  avatarStyle: "thumbs",
};

const keys = Object.keys(DEFAULT_USER_PREFERENCES);

export function rawToPartialUserPreferences(
  raw: RawUserPreferences,
): Partial<UserPreferences> {
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([_, value]) => value !== undefined)
      .filter(([key, _]) => keys.includes(key)),
  );
}

interface State {
  preferences?: Partial<UserPreferences>;
  selectedModel?: Model;
}

const State: z.ZodType<State> = z.object({
  get preferences() {
    return RawUserPreferences.optional();
  },
  get selectedModel() {
    return Model.optional();
  },
});

type Action =
  | { kind: "set"; next: State }
  | { kind: "clear" }
  | { kind: "setPreferences"; raw: RawUserPreferences }
  | { kind: "updatePreferences"; partial: PartialUserPreferences }
  | { kind: "setSelectedModel"; selectedModel: string };

const reducer = (state: State, action: Action): State => {
  const { kind } = action;

  if (kind === "set") {
    const { next } = action;
    return {
      ...next,
    };
  }

  if (kind === "clear") {
    return {};
  }

  if (kind === "setPreferences") {
    const { raw } = action;

    const preferences = rawToPartialUserPreferences(raw);
    return {
      ...state,
      preferences,
    };
  }

  if (kind === "updatePreferences") {
    const { partial } = action;

    let preferences = state.preferences;

    Object.entries(partial).forEach(([key, value]) => {
      if (value === undefined) {
        delete preferences?.[key as UserPreferenceKey];
      } else {
        preferences ??= {};
        Reflect.set(preferences, key, value);
      }
    });

    return {
      ...state,
      preferences,
    };
  }

  if (kind === "setSelectedModel") {
    const { selectedModel } = action;

    return {
      ...state,
      selectedModel: Model.parse(selectedModel),
    };
  }

  const _: never = kind;
  throw new Error(`Invalid action kind: ${kind}.`);
};

export type UserSessionStorage = State;
export type DispatchUserSessionStorage = ActionDispatch<[action: Action]>;

export function useUserSessionStorage(): [
  data: UserSessionStorage,
  dispatch: DispatchUserSessionStorage,
] {
  const [state, dispatch] = useReducer(reducer, null, () => {
    return {};
  });

  useEffect(() => {
    const item = sessionStorage.getItem(SESSION_STORAGE_NAME);

    let state: State = {};
    try {
      if (item) {
        state = State.parse(JSON.parse(item));
      }
    } catch (_e) {
      // noop
    }

    if (state.preferences) {
      state.preferences = rawToPartialUserPreferences(state.preferences);
    }

    dispatch({ kind: "set", next: state });
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_NAME, JSON.stringify(state));
  }, [state]);

  return [state, dispatch];
}
