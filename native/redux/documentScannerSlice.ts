import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CameraCapturedPicture } from "expo-camera";
import {
  ProcessInvoiceResponse,
  ProcessSalesRaportResponse,
} from "../db/types";
import { RootState } from "./store";

interface DocumentScannerSlice {
  isPreviewShown: boolean;
  isTakingPhoto: boolean;
  isCameraReady: boolean | null;
  photo: CameraCapturedPicture | undefined | null;
  processedInvoice: ProcessInvoiceResponse;
  newMatched: {
    [recordId: number]: {
      product_id: number;
      price_per_unit: number;
      quantity: number;
    };
  };
  processedSalesRaport: ProcessSalesRaportResponse;
  inventory_id: number | null;
}

const initialState: DocumentScannerSlice = {
  isTakingPhoto: false,
  isPreviewShown: false,
  isCameraReady: null,
  photo: null,
  processedInvoice: null,
  newMatched: {},
  processedSalesRaport: null,
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
    PHOTO_START: (state) => ({ ...state, isTakingPhoto: true }),
    PHOTO_END: (state) => ({ ...state, isTakingPhoto: false }),
    PHOTO_RESET_DATA: (state) => ({
      ...state,
      photo: null,
      isPreviewShown: false,
      isTakingPhoto: false,
    }),
    SET_PROCESSED_INVOICE: (
      state,
      {
        payload,
      }: PayloadAction<{
        processedInvoice: DocumentScannerSlice["processedInvoice"];
      }>
    ) => ({ ...state, processedInvoice: payload.processedInvoice }),
    SET_NEW_MATCHED: (
      state,
      {
        payload,
      }: PayloadAction<{
        newMatched: DocumentScannerSlice["newMatched"];
      }>
    ) => ({ ...state, newMatched: payload.newMatched }),
    SET_PROCESSED_SALES_RAPORT: (
      state,
      {
        payload,
      }: PayloadAction<{
        processedSalesRaport: DocumentScannerSlice["processedSalesRaport"];
      }>
    ) => ({ ...state, processedSalesRaport: payload.processedSalesRaport }),
    RESET_PROCESSED_INVOICE: (state) => ({
      ...state,
      processedInvoice: null,
    }),
    RESET_PROCESSED_SALES_RAPORT: (state) => ({
      ...state,
      processedSalesRaport: null,
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
    selectisTakingPhoto: (state) => state.isTakingPhoto,
    selectPhoto: (state) => state.photo,
    selectInventoryId: (state) => state.inventory_id,
    selectNewMatched: (state) => state.newMatched,
    selectProcessedInvoice: (state) => state.processedInvoice,
    selectProcessedSalesRaport: (state) => state.processedSalesRaport,
    selectInvoiceUnmatchedAliases: (state) =>
      state.processedInvoice?.unmatchedAliases,
    selectSalesRaportUnmatchedAliases: (state) =>
      state.processedSalesRaport?.unmatchedAliases,
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
