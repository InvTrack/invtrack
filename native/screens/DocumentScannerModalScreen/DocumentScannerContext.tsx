import { CameraCapturedPicture } from "expo-camera";
import { createContext, useContext } from "react";
import {
  ProcessInvoiceResponse,
  ProcessSalesRaportResponse,
} from "../../db/types";

export type DocumentScannerState = {
  isPreviewShown: boolean;
  isTakingPhoto: boolean;
  photo: CameraCapturedPicture | null;
  processedInvoice: ProcessInvoiceResponse | null;
  processedSalesReport: ProcessSalesRaportResponse | null;
};

export const initialDocumentScannerState: DocumentScannerState = {
  isPreviewShown: false,
  isTakingPhoto: false,
  photo: null,
  processedInvoice: null,
  processedSalesReport: null,
};

type DocumentScannerContextType = {
  documentScannerState: DocumentScannerState;
  setDocumentScannerState: React.Dispatch<
    React.SetStateAction<DocumentScannerState>
  >;
  resetDocumentScanner: () => void;
};

export const DocumentScannerContext = createContext<DocumentScannerContextType>(
  {
    documentScannerState: initialDocumentScannerState,
    setDocumentScannerState: () => null,
    resetDocumentScanner: () => null,
  }
);

export const useDocumentScannerContext = () => {
  return useContext(DocumentScannerContext);
};
