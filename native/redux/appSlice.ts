import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  cameraRatio: string | null;
  isCameraReady: boolean;
}

const initialState: AppState = {
  cameraRatio: null,
  isCameraReady: false,
};

/**
 * misc global app data
 */
export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    SET_CAMERA_RATIO: (
      state,
      {
        payload,
      }: PayloadAction<{ cameraRatio: NonNullable<AppState["cameraRatio"]> }>
    ) => ({
      ...state,
      cameraRatio: payload.cameraRatio,
    }),
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
    selectCameraRatio: (state) => state.cameraRatio,
    selectIsCameraReady: (state) => state.isCameraReady,
  },
});

export const appAction = { ...appSlice.actions };
export const appSelector = { ...appSlice.selectors };

export const appSliceReducer = appSlice.reducer;
