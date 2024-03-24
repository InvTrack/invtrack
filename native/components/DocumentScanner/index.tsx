import { DocumentScannerContent } from "./DocumentScannerContent";
import DocumentScannerContextProvider from "./DocumentScannerContext";

// useReducer would be nice here?
export const DocumentScanner = () => (
  <DocumentScannerContextProvider>
    <DocumentScannerContent />
  </DocumentScannerContextProvider>
);
