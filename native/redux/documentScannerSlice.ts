import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CameraCapturedPicture } from "expo-camera";
import { ScanDocResponse } from "../db/types";
import { RootState } from "./store";

interface DocumentScannerSlice {
  isPreviewShown: boolean;
  isProcessingPhotoData: boolean;
  isCameraReady: boolean | null;
  photo: CameraCapturedPicture | null;
  processedInvoice: ScanDocResponse;
  inventory_id: number | null;
}

const initialState: DocumentScannerSlice = {
  isProcessingPhotoData: false,
  isPreviewShown: false,
  isCameraReady: null,
  photo: null,
  processedInvoice: null,
  inventory_id: null,
} as DocumentScannerSlice;

export const documentScannerSlice = createSlice({
  name: "documentScanner",
  initialState,
  reducers: {
    SWITCH_PREVIEW: (state) => ({
      ...state,
      isPreviewShown: !state.isPreviewShown,
    }),
    PHOTO_TAKE: (
      state,
      { payload }: PayloadAction<{ photo: DocumentScannerSlice["photo"] }>
    ) => ({
      ...state,
      photo: payload.photo || null,
    }),
    PHOTO_RETAKE: (state) => ({
      ...state,
      photo: null,
      isPreviewShown: false,
    }),
    PHOTO_START: (state) => ({ ...state, isProcessingPhotoData: true }),
    PHOTO_END: (state) => ({ ...state, isProcessingPhotoData: false }),
    PHOTO_RESET_DATA: (state) => ({
      ...state,
      photo: null,
      isPreviewShown: false,
      isProcessingPhotoData: false,
    }),
    INVOICE_PROCESSING_RESULT: (
      state,
      {
        payload,
      }: PayloadAction<{
        processedInvoice: DocumentScannerSlice["processedInvoice"];
      }>
    ) => ({ ...state, processedInvoice: payload.processedInvoice }),
    RESET_INVOICE_PROCESSING_RESULT: (state) => ({
      ...state,
      processedInvoice: null,
    }),
    SET_INVENTORY_ID: (
      state,
      {
        payload,
      }: PayloadAction<{ inventory_id: DocumentScannerSlice["inventory_id"] }>
    ) => ({ ...state, inventory_id: payload.inventory_id }),
    RESET_INVENTORY_ID: (state) => ({ ...state, inventory_id: null }),
  },
  selectors: {
    selectIsPreviewShown: (state) => state.isPreviewShown,
    selectIsProcessingPhotoData: (state) => state.isProcessingPhotoData,
    selectPhoto: (state) => state.photo,
    selectInventoryId: (state) => state.inventory_id,
    selectProcessedInvoice: (state) => state.processedInvoice,
    selectUnmatchedAliases: (state) => state.processedInvoice?.unmatchedAliases,
  },
});

export const documentScannerAction = { ...documentScannerSlice.actions };
export const documentScannerSelector = { ...documentScannerSlice.selectors };
// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectdocumentScannerSlice = (state: RootState) =>
  state.documentScanner;

export const documentScannerSliceReducer = documentScannerSlice.reducer;
