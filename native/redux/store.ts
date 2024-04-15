import { Action, ThunkAction, Tuple, configureStore } from "@reduxjs/toolkit";
import { counterSliceReducer } from "./counterSlice";
import { documentScannerSliceReducer } from "./documentScannerSlice";
import { snackbarSliceReducer } from "./snackbarSlice";

// @ts-expect-error
const logger = (store) => (next) => (action) => {
  console.log(
    `@redux_logger@\n`,
    JSON.stringify(
      action,
      (_, value) => {
        if (typeof value === "string") {
          return value.substring(0, 500);
        }
        return value;
      },
      2
    )
  );
  return next(action);
};

export const store = configureStore({
  reducer: {
    counter: counterSliceReducer,
    documentScanner: documentScannerSliceReducer,
    snackbar: snackbarSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    new Tuple(logger, ...getDefaultMiddleware()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
