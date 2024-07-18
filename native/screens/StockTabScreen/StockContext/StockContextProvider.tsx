import React, { ReactNode, createContext, useContext } from "react";
import { Updater, useImmer } from "use-immer";
import { useListProductRecords } from "../../../db/hooks/useListProductRecords";
import {
  DocumentScannerState,
  ProductRecordsByProductId,
  RecipeRecordsByRecipeId,
  StockData,
} from "./types";

const initialDocumentScannerState: DocumentScannerState = {
  isPreviewShown: false,
  isTakingPhoto: false,
  isCameraReady: null,
  photo: null,
  processedInvoice: null,
  processedSalesRaport: null,
  inventory_id: null,
};

const initialStockId = 0;
const initialProductRecords: ProductRecordsByProductId = {};
const initialRecipeRecords: RecipeRecordsByRecipeId = {};

type StockContextType = StockData & {
  stockId: number;
  stockType: "inventory" | "delivery";
  updateProductRecords: Updater<ProductRecordsByProductId>;
  updateRecipeRecords: Updater<RecipeRecordsByRecipeId>;
  documentScannerState: DocumentScannerState;
  setDocumentScannerState: Updater<DocumentScannerState>;
};

const StockContext = createContext<StockContextType>({
  stockType: "delivery",
  stockId: initialStockId,
  productRecords: initialProductRecords,
  updateProductRecords: () => null,
  recipeRecords: initialRecipeRecords,
  updateRecipeRecords: () => null,
  documentScannerState: initialDocumentScannerState,
  setDocumentScannerState: () => null,
});

export const StockContextProvider = ({
  children,
  stockId,
}: {
  children: ReactNode;
  stockId: number;
}) => {
  const stockType = "delivery";

  const { data: productRecordsRaw } = useListProductRecords(stockId);
  const [productRecords, updateProductRecords] =
    useImmer<ProductRecordsByProductId>(
      productRecordsRaw
        ? Object.fromEntries(
            productRecordsRaw.map((record) => [
              record.product_id,
              {
                record_id: record.id,
                quantity: record.quantity,
                price_per_unit: record.price_per_unit,
              },
            ])
          )
        : initialProductRecords
    );
  const [recipeRecords, updateRecipeRecords] = useImmer(initialRecipeRecords);

  const [documentScannerState, setDocumentScannerState] =
    useImmer<DocumentScannerState>(initialDocumentScannerState);

  // const setProductRecord = (product_id: number, value: Partial<ProductRecordByProductId>) => setProductRecords(records => ({...records}))

  return (
    <StockContext.Provider
      value={{
        stockId,
        stockType,
        productRecords,
        updateProductRecords,
        recipeRecords,
        updateRecipeRecords,
        documentScannerState,
        setDocumentScannerState,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  return useContext(StockContext);
};
