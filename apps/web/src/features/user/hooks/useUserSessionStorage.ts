import type {
  PartialUserPreferences,
  UserPreferenceKey,
  UserPreferences,
} from "@/common-schemas";
import { Model, RawUserPreferences } from "@repo/common";
import { useCallback, useEffect, useMemo, useState } from "react";
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

export function filterRawUserPreferences(
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

export function useUserSessionStorage() {
  const [state, setState] = useState<State>({});

  useEffect(() => {
    const stringified = sessionStorage.getItem(SESSION_STORAGE_NAME) || "{}";

    let state: State = {};
    try {
      state = State.parse(JSON.parse(stringified));
      if (state.preferences) {
        state.preferences = filterRawUserPreferences(state.preferences);
      }
    } catch (_e) {
      // noop
    }

    Promise.try(() => {
      setState(state);
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_NAME, JSON.stringify(state));
  }, [state]);

  const clear = useCallback(() => {
    setState({});
  }, []);

  const setPreferences = useCallback((raw: RawUserPreferences) => {
    setState((state) => {
      const preferences = filterRawUserPreferences(raw);

      return {
        ...state,
        preferences,
      };
    });
  }, []);

  const updatePreferences = useCallback((partial: PartialUserPreferences) => {
    setState((state) => {
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
    });
  }, []);

  return useMemo(
    () => ({
      data: state,
      clear,
      setPreferences,
      updatePreferences,
    }),
    [state, clear, setPreferences, updatePreferences],
  );
}
