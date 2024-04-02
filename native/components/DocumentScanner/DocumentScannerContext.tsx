import { CameraCapturedPicture } from "expo-camera";
import React, { createContext, useReducer } from "react";

interface DocumentScannerContextValue {
  dispatch: React.Dispatch<DocumentScannerAction>;
  state: {
    isPreviewShown: boolean;
    isProcessingPhotoData: boolean;
    isCameraReady: boolean | null;
    photo: CameraCapturedPicture | null;
    ratio: string;
    processedInvoice: ProcessedInvoice;
    inventory_id: number | null;
  };
}
export interface DocumentScannerContextProviderProps {
  children: React.ReactNode;
}

/**
 * assignable to Inventory/Delivery Forms
 */
export type ProcessedInvoice = {
  [record_id: string]: {
    quantity: number;
    product_id: number;
    price_per_unit: number | null;
  };
} | null;

export type DocumentScannerAction =
  | {
      type: "SWITCH_PREVIEW";
      payload?: {};
    }
  | {
      type: "CAMERA_READY";
      payload?: {};
    }
  | {
      type: "SET_RATIO";
      payload: {
        ratio: string;
      };
    }
  | {
      type: "PHOTO_START";
      payload?: {};
    }
  | {
      type: "PHOTO_END";
      payload?: {};
    }
  | {
      type: "PHOTO_RETAKE";
      payload?: {};
    }
  | {
      type: "PHOTO_TAKE";
      payload: {
        photo: CameraCapturedPicture;
      };
    }
  | {
      type: "PHOTO_RESET_DATA";
      payload?: {};
    }
  | {
      type: "PROCESSED_INVOICE";
      payload: {
        processedInvoice: ProcessedInvoice;
      };
    }
  | {
      type: "SET_INVENTORY_ID";
      payload: {
        inventory_id: number;
      };
    }
  | {
      type: "RESET_INVENTORY_ID";
      payload?: {};
    };

const initialState = {
  isProcessingPhotoData: false,
  isPreviewShown: false,
  isCameraReady: null,
  photo: null,
  ratio: "16:9",
  processedInvoice: null,
  inventory_id: null,
};

export const DocumentScannerContext =
  createContext<DocumentScannerContextValue>({
    dispatch: () => {},
    state: initialState,
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
    case "PHOTO_RESET_DATA":
      return {
        ...state,
        photo: null,
        isPreviewShown: false,
        isProcessingPhotoData: false,
      };
    case "PROCESSED_INVOICE":
      return { ...state, processedInvoice: payload.processedInvoice };
    case "SET_INVENTORY_ID":
      return { ...state, inventory_id: payload.inventory_id };
    case "RESET_INVENTORY_ID":
      return { ...state, inventory_id: null };
    default:
      return { ...state };
  }
};

const DocumentScannerContextProvider = ({
  children,
}: DocumentScannerContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <DocumentScannerContext.Provider value={{ state, dispatch }}>
      {children}
    </DocumentScannerContext.Provider>
  );
};

export default DocumentScannerContextProvider;
