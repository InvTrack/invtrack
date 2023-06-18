import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useAppState(onChange: (state: AppStateStatus) => void) {
  useEffect(() => {
    AppState.addEventListener("change", onChange);
    // no cleanup function to return
  }, [onChange]);
}
