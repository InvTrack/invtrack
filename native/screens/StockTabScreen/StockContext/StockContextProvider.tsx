import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { useListProductRecords } from "../../../db/hooks/useListProductRecords";
import {
  ProductRecordByProductIdValue,
  ProductRecordsByProductId,
  RecipeRecordByRecipeIdValue,
  RecipeRecordsByRecipeId,
  StockData,
} from "./types";

const initialStockId = 0;
const initialProductRecords: ProductRecordsByProductId = {};
const initialRecipeRecords: RecipeRecordsByRecipeId = {};

type StockContextType = StockData & {
  stockId: number;
  stockType: "inventory" | "delivery";
  setProductRecords: React.Dispatch<
    React.SetStateAction<ProductRecordsByProductId>
  >;
  setRecipeRecords: React.Dispatch<
    React.SetStateAction<RecipeRecordsByRecipeId>
  >;
  recordsFromInvoice: ProductRecordsByProductId;
  setRecordsFromInvoice: React.Dispatch<
    React.SetStateAction<ProductRecordsByProductId>
  >;
};

const StockContext = createContext<StockContextType>({
  stockType: "delivery",
  stockId: initialStockId,
  productRecords: initialProductRecords,
  setProductRecords: () => null,
  recipeRecords: initialRecipeRecords,
  setRecipeRecords: () => null,
  recordsFromInvoice: initialProductRecords,
  setRecordsFromInvoice: () => null,
});

export const StockContextProvider = ({
  children,
  stockId,
}: {
  children: ReactNode;
  stockId: number;
}) => {
  // WIP
  const stockType = "delivery";

  const { data: productRecordsRaw } = useListProductRecords(stockId);
  const defaultProductRecords = productRecordsRaw
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
    : {};

  const [productRecords, setProductRecords] =
    useState<ProductRecordsByProductId>(defaultProductRecords);
  const [recordsFromInvoice, setRecordsFromInvoice] =
    useState<ProductRecordsByProductId>(defaultProductRecords);

  const [recipeRecords, setRecipeRecords] = useState(initialRecipeRecords);

  return (
    <StockContext.Provider
      value={{
        stockId,
        stockType,
        productRecords,
        setProductRecords,
        recipeRecords,
        setRecipeRecords,
        recordsFromInvoice,
        setRecordsFromInvoice,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

const mergeRawAndInvoiceProductRecords = (
  raw: ProductRecordsByProductId,
  invoice: ProductRecordsByProductId
) => {
  const ret: ProductRecordsByProductId = JSON.parse(JSON.stringify(raw));

  for (const product_id in invoice) {
    const { quantity, price_per_unit } = invoice[product_id];
    if (product_id in ret) {
      ret[product_id].quantity = ret[product_id].quantity + quantity;
      ret[product_id].price_per_unit = price_per_unit;
    } else {
      ret[product_id] = { quantity, price_per_unit };
    }
  }

  return ret;
};

export const useStockContext = () => {
  const context = useContext(StockContext);

  const setProductRecord = (
    productId: number,
    value: Partial<ProductRecordByProductIdValue>
  ) => {
    context.setProductRecords((r) => ({
      ...r,
      [productId]: { ...r[productId], ...value },
    }));
  };

  const setRecipeRecord = (
    recipeId: number,
    value: Partial<RecipeRecordByRecipeIdValue>
  ) => {
    context.setRecipeRecords((r) => ({
      ...r,
      [recipeId]: { ...r[recipeId], ...value },
    }));
  };

  const productRecords = useMemo(
    () =>
      mergeRawAndInvoiceProductRecords(
        context.productRecords,
        context.recordsFromInvoice
      ),
    [context.productRecords, context.recordsFromInvoice]
  );

  return { ...context, productRecords, setProductRecord, setRecipeRecord };
};
