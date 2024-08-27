import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useListProductRecords } from "../../../db/hooks/useListProductRecords";
import { useListRecipeRecords } from "../../../db/hooks/useListRecipeRecords";
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
  setStockId: React.Dispatch<React.SetStateAction<number>>;
  // stockType: "inventory" | "delivery";
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
  recordsFromSalesRaport: RecipeRecordsByRecipeId;
  setRecordsFromSalesRaport: React.Dispatch<
    React.SetStateAction<RecipeRecordsByRecipeId>
  >;
};

const StockContext = createContext<StockContextType>({
  // stockType: "delivery",
  stockId: initialStockId,
  setStockId: () => null,
  productRecords: initialProductRecords,
  setProductRecords: () => null,
  recipeRecords: initialRecipeRecords,
  setRecipeRecords: () => null,
  recordsFromInvoice: initialProductRecords,
  setRecordsFromInvoice: () => null,
  recordsFromSalesRaport: initialRecipeRecords,
  setRecordsFromSalesRaport: () => null,
});

export const StockContextProvider = ({
  children,
  // TODO delete
  stockId: inStockId,
}: {
  children: ReactNode;
  stockId: number | undefined;
}) => {
  const [stockId, setStockId] = useState(inStockId || 0);

  const [recordsFromSalesRaport, setRecordsFromSalesRaport] =
    useState<RecipeRecordsByRecipeId>({});
  const [recordsFromInvoice, setRecordsFromInvoice] =
    useState<ProductRecordsByProductId>({});

  const [recipeRecords, setRecipeRecords] = useState<RecipeRecordsByRecipeId>(
    {}
  );
  const [productRecords, setProductRecords] =
    useState<ProductRecordsByProductId>({});

  // console.log(stockId);

  //@ts-ignore
  const { data: recipeRecordsRaw } = useListRecipeRecords(stockId);
  //@ts-ignore
  const { data: productRecordsRaw } = useListProductRecords(stockId);

  // Whenever stockId or fetched data changes, update the records
  useEffect(() => {
    const defaultRecipeRecords = recipeRecordsRaw
      ? Object.fromEntries(
          recipeRecordsRaw.map((record) => [
            record.recipe_id,
            {
              record_id: record.id,
              quantity: record.quantity,
            },
          ])
        )
      : {};

    setRecipeRecords(defaultRecipeRecords);

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

    setProductRecords(defaultProductRecords);
  }, [stockId]);

  // console.log({ stockId, recipeRecords, productRecords });

  return (
    <StockContext.Provider
      value={{
        //@ts-ignore
        stockId,
        setStockId,
        // stockType,
        productRecords,
        setProductRecords,
        recipeRecords,
        setRecipeRecords,
        recordsFromInvoice,
        setRecordsFromInvoice,
        recordsFromSalesRaport,
        setRecordsFromSalesRaport,
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

const mergeRawAndSalesRaportRecipeRecords = (
  raw: RecipeRecordsByRecipeId,
  invoice: RecipeRecordsByRecipeId
) => {
  const ret: RecipeRecordsByRecipeId = JSON.parse(JSON.stringify(raw));

  for (const recipe_id in invoice) {
    const { quantity } = invoice[recipe_id];
    if (recipe_id in ret) {
      ret[recipe_id].quantity = ret[recipe_id].quantity + quantity;
    } else {
      ret[recipe_id] = { quantity, record_id: null };
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

  const recipeRecords = useMemo(
    () =>
      mergeRawAndSalesRaportRecipeRecords(
        context.recipeRecords,
        context.recordsFromSalesRaport
      ),
    [context.recipeRecords, context.recordsFromSalesRaport]
  );

  return {
    ...context,
    productRecords,
    recipeRecords,
    setProductRecord,
    setRecipeRecord,
  };
};
