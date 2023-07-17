import React, { createContext, useMemo, useReducer } from "react";

import type {
  BottomSheetAction,
  BottomSheetExternalContextValue,
  BottomSheetInternalContextValue,
  BottomSheetProviderProps,
} from "./types";

/**
 * - Internal is used solely by the BottomSheet Component and contains the component to render
 * - External exposes the dispatch function
 *
 * Always use external outside
 */
export const BottomSheetExternalContext =
  createContext<BottomSheetExternalContextValue>({
    dispatch: () => {},
  });

BottomSheetExternalContext.displayName = "BottomSheetExternalContext";

export const BottomSheetInternalContext =
  createContext<BottomSheetInternalContextValue>({
    isOpen: false,
    content: null,
    newContent: null,
  });

BottomSheetInternalContext.displayName = "BottomSheetInternalContext";

const reducer = (
  state: BottomSheetInternalContextValue,
  { type, payload }: BottomSheetAction
) => {
  switch (type) {
    case "OPEN":
      return {
        content: state.content ? state.content : payload ?? null,
        newContent: state.content ? payload ?? null : null,
        isOpen: true,
      };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "RESET":
      return {
        content: null,
        newContent: null,
        isOpen: false,
      };
    case "REMOVE":
      return {
        ...state,
        content: null,
      };
    case "REPLACE":
      return {
        ...state,
        content: state.newContent,
        newContent: null,
      };
    default:
      return state;
  }
};

const BottomSheetProvider = ({ children }: BottomSheetProviderProps) => {
  const [values, dispatch] = useReducer(reducer, {
    isOpen: false,
    content: null,
    newContent: null,
  });

  const externalValues = useMemo(() => ({ dispatch }), []);

  return (
    <BottomSheetExternalContext.Provider value={externalValues}>
      <BottomSheetInternalContext.Provider value={values}>
        {children}
      </BottomSheetInternalContext.Provider>
    </BottomSheetExternalContext.Provider>
  );
};

export default BottomSheetProvider;
