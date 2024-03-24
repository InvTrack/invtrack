import { DocumentScannerContent } from "./DocumentScannerContent";
import DocumentScannerContextProvider from "./DocumentScannerContext";

export const DocumentScanner = () => (
  <DocumentScannerContextProvider>
    <DocumentScannerContent />
  </DocumentScannerContextProvider>
);
