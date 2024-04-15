import { Action, ThunkAction, Tuple, configureStore } from "@reduxjs/toolkit";
import { counterSliceReducer } from "./counterSlice";
import { documentScannerSliceReducer } from "./documentScannerSlice";

// @ts-expect-error
const logger = (store) => (next) => (action) => {
  console.log(`@redux_logger@\n`, JSON.stringify(action, null, 2));
  return next(action);
};

export const store = configureStore({
  reducer: {
    counter: counterSliceReducer,
    documentScanner: documentScannerSliceReducer,
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
