import { useCallback, useContext } from "react";

import { BottomSheetExternalContext } from "./BottomSheetContext";
import { BottomSheetActionPayload } from "./types";

export const useBottomSheet = () => {
  const { dispatch } = useContext(BottomSheetExternalContext);

  const openBottomSheet = useCallback(
    (payload: BottomSheetActionPayload) => {
      dispatch({ type: "OPEN", payload });
    },
    [dispatch]
  );

  const closeBottomSheet = useCallback(() => {
    dispatch({ type: "CLOSE" });
  }, [dispatch]);

  return { openBottomSheet, closeBottomSheet };
};
