import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectSnackbarSlice, snackbarAction } from "../../redux/snackbarSlice";
import { SnackbarMessage } from "./types";

export const useSnackbar = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectSnackbarSlice);

  const showSuccess = useCallback((message: SnackbarMessage) => {
    dispatch(snackbarAction.SHOW_SNACKBAR({ message, type: "success" }));
  }, []);
  const showError = useCallback((message: SnackbarMessage) => {
    dispatch(snackbarAction.SHOW_SNACKBAR({ message, type: "error" }));
  }, []);
  const showInfo = useCallback((message: SnackbarMessage) => {
    dispatch(snackbarAction.SHOW_SNACKBAR({ message, type: "info" }));
  }, []);

  return { showSuccess, showError, showInfo, dispatch, state };
};
