import { useCallback, useContext, useMemo } from "react";

import {
  BottomSheetExternalContext,
  BottomSheetInternalContext,
} from "../BottomSheetContext";

export const useInternalBottomSheet = () => {
  const { dispatch } = useContext(BottomSheetExternalContext);
  const { isOpen, content, newContent } = useContext(
    BottomSheetInternalContext
  );

  const closeBottomSheet = useCallback(() => {
    dispatch({ type: "CLOSE" });
  }, [dispatch]);

  const resetBottomSheet = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  const replaceBottomSheet = useCallback(() => {
    dispatch({ type: "REMOVE" });
    dispatch({ type: "REPLACE" });
  }, [dispatch]);

  const showBottomSheet = useMemo(() => !!content, [content]);

  return {
    isOpen,
    showBottomSheet,
    content,
    newContent,
    closeBottomSheet,
    resetBottomSheet,
    replaceBottomSheet,
  };
};
