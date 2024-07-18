import { CameraCapturedPicture } from "expo-camera";
import { createContext, useContext } from "react";
import { Updater } from "use-immer";
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
  updateDocumentScannerState: Updater<DocumentScannerState>;
  resetDocumentScanner: () => void;
};

export const DocumentScannerContext = createContext<DocumentScannerContextType>(
  {
    documentScannerState: initialDocumentScannerState,
    updateDocumentScannerState: () => null,
    resetDocumentScanner: () => null,
  }
);

// export const DocumentScannerContextProvider = ({
//   children,
// }: {
//   children: ReactNode;
// }) => {
//   const [documentScannerState, updateDocumentScannerState] =
//     useImmer<DocumentScannerState>(initialDocumentScannerState);

//   const resetDocumentScanner = () =>
//     updateDocumentScannerState(initialDocumentScannerState);

//   return (
//     <DocumentScannerContext.Provider
//       value={{
//         documentScannerState,
//         updateDocumentScannerState,
//         resetDocumentScanner,
//       }}
//     >
//       {children}
//     </DocumentScannerContext.Provider>
//   );
// };

export const useDocumentScannerContext = () => {
  return useContext(DocumentScannerContext);
};
