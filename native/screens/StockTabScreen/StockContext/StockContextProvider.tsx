import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { Updater, useImmer } from "use-immer";
import { useListProductRecords } from "../../../db/hooks/useListProductRecords";
import {
  ProductRecordsByProductId,
  RecipeRecordsByRecipeId,
  StockData,
} from "./types";

const initialStockId = 0;
const initialProductRecords: ProductRecordsByProductId = {};
const initialRecipeRecords: RecipeRecordsByRecipeId = {};

type StockContextType = StockData & {
  stockId: number;
  stockType: "inventory" | "delivery";
  updateProductRecords: Updater<ProductRecordsByProductId>;
  updateRecipeRecords: Updater<RecipeRecordsByRecipeId>;
  recordsFromInvoice: ProductRecordsByProductId;
  setRecordsFromInvoice: React.Dispatch<
    React.SetStateAction<ProductRecordsByProductId>
  >;
};

const StockContext = createContext<StockContextType>({
  stockType: "delivery",
  stockId: initialStockId,
  productRecords: initialProductRecords,
  updateProductRecords: () => null,
  recipeRecords: initialRecipeRecords,
  updateRecipeRecords: () => null,
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

  const [productRecords, updateProductRecords] =
    useImmer<ProductRecordsByProductId>(defaultProductRecords);
  const [recordsFromInvoice, setRecordsFromInvoice] =
    useState<ProductRecordsByProductId>(defaultProductRecords);

  const [recipeRecords, updateRecipeRecords] = useImmer(initialRecipeRecords);

  return (
    <StockContext.Provider
      value={{
        stockId,
        stockType,
        productRecords,
        updateProductRecords,
        recipeRecords,
        updateRecipeRecords,
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

  const productRecords = useMemo(
    () =>
      mergeRawAndInvoiceProductRecords(
        context.productRecords,
        context.recordsFromInvoice
      ),
    [context.productRecords, context.recordsFromInvoice]
  );

  return { ...context, productRecords };
};
