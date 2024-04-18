import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SnackbarMessage, SnackbarType } from "../components/Snackbar/types";
import { RootState } from "./store";

const initialState: {
  id: number;
  message: SnackbarMessage;
  type: SnackbarType;
}[] = [];

export const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    SHOW_SNACKBAR: (
      state,
      {
        payload,
      }: PayloadAction<{ message: SnackbarMessage; type: SnackbarType }>
    ) => {
      return [
        ...state,
        {
          ...payload,
          id: state.reduce((sum) => sum + 1, 1),
        },
      ];
    },
    HIDE_SNACKBAR: (state, { payload }: PayloadAction<{ id: number }>) =>
      state.filter((it) => it.id !== payload.id),
  },
});

export const snackbarAction = {
  ...snackbarSlice.actions,
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSnackbarSlice = (state: RootState) => state.snackbar;

export const snackbarSliceReducer = snackbarSlice.reducer;
