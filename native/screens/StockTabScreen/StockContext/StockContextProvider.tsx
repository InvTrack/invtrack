import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useListInventories } from "../../../db/hooks/useListInventories";
import { useListProductRecords } from "../../../db/hooks/useListProductRecords";
import { useListRecipeRecords } from "../../../db/hooks/useListRecipeRecords";
import { useListRecipesWithRecords } from "../../../db/hooks/useListRecipes";
import { roundFloat } from "../../../utils";
import { mergeRawAndScannedRecords } from "./mergeRawAndScanned";
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
  stockId?: number;
  setStockId: React.Dispatch<React.SetStateAction<number | undefined>>;
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
  stockId: routeStockId,
}: {
  children: ReactNode;
  stockId: number | undefined;
}) => {
  const { data: stocks } = useListInventories();
  const latestStockId = stocks?.[0]?.id;

  const [stockId, setStockId] = useState(routeStockId ?? latestStockId);

  const [recordsFromSalesRaport, setRecordsFromSalesRaport] =
    useState<RecipeRecordsByRecipeId>({});
  const [recordsFromInvoice, setRecordsFromInvoice] =
    useState<ProductRecordsByProductId>({});

  const [recipeRecords, setRecipeRecords] = useState<RecipeRecordsByRecipeId>(
    {}
  );
  const [productRecords, setProductRecords] =
    useState<ProductRecordsByProductId>({});

  const { data: recipeRecordsRaw } = useListRecipeRecords(stockId);
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

    // Reset scanner state on navigation to another stock
    setRecordsFromSalesRaport({});
    setRecordsFromInvoice({});
  }, [stockId, productRecordsRaw, recipeRecordsRaw]);

  return (
    <StockContext.Provider
      value={{
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

export const useStockContext = () => {
  const context = useContext(StockContext);

  const { data: recipeList } = useListRecipesWithRecords(context.stockId);

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

  // TODO: Consider doing this non destructively, similarely to scanning
  const setRecipeQuantityWithProductQuantities =
    (recipeId: number) => (value: number) => {
      const recipe = context.recipeRecords[recipeId];
      const oldQuantity = recipe?.quantity || 0;
      const delta = value - oldQuantity;
      const recipeParts = recipeList?.find(
        (r) => r.id === recipeId
      )?.recipe_part;
      if (!recipeParts || delta === 0 || value < 0) return;

      recipeParts.forEach((part) => {
        const oldQuantity =
          context.productRecords[part.product_id]?.quantity || 0;
        const dMultiplied = roundFloat(delta * part.quantity);
        const newRecordQuantity = roundFloat(oldQuantity - dMultiplied);

        setProductRecord(part.product_id, { quantity: newRecordQuantity });
      });

      setRecipeRecord(recipeId, { quantity: value });
      return;
    };

  const { mergedProductRecords, mergedRecipeRecords } = useMemo(
    () =>
      mergeRawAndScannedRecords(
        context.recipeRecords,
        context.recordsFromSalesRaport,
        context.productRecords,
        context.recordsFromInvoice,
        recipeList
      ),
    [
      context.recipeRecords,
      context.recordsFromSalesRaport,
      context.productRecords,
      context.recordsFromInvoice,
      recipeList,
    ]
  );

  return {
    ...context,
    productRecords: mergedProductRecords,
    recipeRecords: mergedRecipeRecords,
    setProductRecord,
    setRecipeRecord,
    setRecipeQuantityWithProductQuantities,
  };
};
