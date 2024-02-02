export type SnackbarMessage = string;
export type SnackbarType = "success" | "error" | "info";
export type SnackbarItem = {
  message: SnackbarMessage;
  type: SnackbarType;
  id: number;
};
export type SnackbarProps = {
  item: SnackbarItem;
  index: number;
};
export type SnackbarAction =
  | {
      type: "SHOW_SNACKBAR";
      payload: { message: SnackbarMessage; type: SnackbarType };
    }
  | {
      type: "HIDE_SNACKBAR";
      payload: { id: number };
    };
