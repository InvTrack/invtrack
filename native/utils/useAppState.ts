import { useEffect } from "react";
import { AppState } from "react-native";

export function useAppState(onChange) {
  useEffect(() => {
    AppState.addEventListener("change", onChange);
    // no cleanup function to return
  }, [onChange]);
}
