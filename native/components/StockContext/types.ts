import { CameraCapturedPicture } from "expo-camera";
import { Dispatch, SetStateAction } from "react";
import { Updater } from "use-immer";
import {
  ProcessInvoiceResponse,
  ProcessSalesRaportResponse,
} from "../../db/types";

type ProductRecordByProductId = {
  record_id: number | null;
  quantity: number;
  price_per_unit: number | null;
};

export type ProductRecordsByProductId = {
  [product_id: string]: ProductRecordByProductId;
};

type RecipeRecordByRecipeId = {
  record_id: number | null;
  quantity: number;
};

export type RecipeRecordsByRecipeId = {
  [product_id: string]: RecipeRecordByRecipeId;
};

export type DocumentScannerState = {
  isPreviewShown: boolean;
  isTakingPhoto: boolean;
  isCameraReady: boolean | null;
  photo: CameraCapturedPicture | null;
  processedInvoice: ProcessInvoiceResponse | null;
  processedSalesRaport: ProcessSalesRaportResponse | null;
  inventory_id: number | null;
};

export type StockData = {
  //   stockId: number;
  //   stockType: "inventory" | "delivery";
  productRecords: ProductRecordsByProductId;
  recipeRecords: RecipeRecordsByRecipeId;
};

export type StockContextType = StockData & {
  stockId: number;
  stockType: "inventory" | "delivery";
  updateProductRecords: Updater<ProductRecordsByProductId>;
  documentScannerState: DocumentScannerState;
  setDocumentScannerState: Dispatch<SetStateAction<DocumentScannerState>>;
};
