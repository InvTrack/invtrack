import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  isCameraReady: boolean;
}

const initialState: AppState = {
  isCameraReady: false,
};

/**
 * misc global app data
 */
export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    SET_IS_CAMERA_READY: (
      state,
      {
        payload,
      }: PayloadAction<{
        isCameraReady: NonNullable<AppState["isCameraReady"]>;
      }>
    ) => ({
      ...state,
      isCameraReady: payload.isCameraReady,
    }),
  },
  selectors: {
    selectIsCameraReady: (state) => state.isCameraReady,
  },
});

export const appAction = { ...appSlice.actions };
export const appSelector = { ...appSlice.selectors };

export const appSliceReducer = appSlice.reducer;
