import { CameraCapturedPicture } from "expo-camera";
import React, { createContext, useReducer } from "react";

interface DocumentScannerContextValue {
  dispatch: React.Dispatch<DocumentScannerAction>;
  state: {
    isPreviewShown: boolean;
    block: false;
    isProcessingPhotoData: boolean;
    isCameraReady: boolean | null;
    photo: CameraCapturedPicture | null;
    ratio: "16:9";
  };
}
export interface DocumentScannerContextProviderProps {
  children: React.ReactNode;
}

export interface DocumentScannerAction {
  type: DocumentScannerActionType;
  payload?: DocumentScannerActionPayload;
}
export type DocumentScannerActionType =
  | "SWITCH_PREVIEW"
  | "CAMERA_READY"
  | "SET_RATIO"
  | "PHOTO_START"
  | "PHOTO_END"
  | "PHOTO_RETAKE"
  | "PHOTO_TAKE";
export type DocumentScannerActionPayload = Partial<
  DocumentScannerContextValue["state"]
>;

export interface DocumentScannerAction {
  type: DocumentScannerActionType;
  payload?: DocumentScannerActionPayload;
}
export const DocumentScannerContext =
  createContext<DocumentScannerContextValue>({
    dispatch: () => {},
    state: {
      block: false,
      isProcessingPhotoData: false,
      isPreviewShown: false,
      isCameraReady: null,
      photo: null,
      ratio: "16:9",
    },
  });

DocumentScannerContext.displayName = "DocumentScannerContext";
const reducer = (
  state: DocumentScannerContextValue["state"],
  { type, payload }: DocumentScannerAction
): DocumentScannerContextValue["state"] => {
  switch (type) {
    case "SWITCH_PREVIEW":
      return { ...state, isPreviewShown: !state.isPreviewShown };
    case "CAMERA_READY":
      return { ...state, isCameraReady: true };
    case "SET_RATIO":
      return { ...state, ratio: payload?.ratio || "16:9" };
    case "PHOTO_TAKE":
      return { ...state, photo: payload?.photo || null };
    case "PHOTO_RETAKE":
      return { ...state, photo: null, isPreviewShown: false };
    case "PHOTO_START":
      return { ...state, isProcessingPhotoData: true };
    case "PHOTO_END":
      return { ...state, isProcessingPhotoData: false };
    default:
      return { ...state };
  }
};

const DocumentScannerContextProvider = ({
  children,
}: DocumentScannerContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, {
    isPreviewShown: false,
    block: false,
    isProcessingPhotoData: false,
    isCameraReady: null,
    photo: null,
    ratio: "16:9",
  });

  return (
    <DocumentScannerContext.Provider value={{ state, dispatch }}>
      {children}
    </DocumentScannerContext.Provider>
  );
};

export default DocumentScannerContextProvider;
