export type SnackbarMessage = string;
export type SnackbarType = "success" | "error" | "info";
export type SnackbarItem = {
  message: SnackbarMessage;
  type: SnackbarType;
  id: number;
};
