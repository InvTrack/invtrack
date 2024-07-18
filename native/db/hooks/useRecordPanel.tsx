import { useCallback } from "react";
import { useStockContext } from "../../screens/StockTabScreen/StockContext/StockContextProvider";
import { roundFloat } from "../../utils";
import { useGetProduct } from "./useGetProduct";

/**
 * This hook simplifies the process of populating the form with the backend data.
 * Registers the records as needed, returns values needed to manipulate the form in a safe way.
 *
 * Submitting the form is done in a separate hook.
 */
export const useRecordPanel = ({
  productId,
}: {
  inventoryId: number;
  productId: number;
}) => {
  const { productRecords, updateProductRecords } = useStockContext();
  const { quantity, price_per_unit } = productRecords[productId];

  const productResult = useGetProduct(productId);
  const { data: product, isSuccess } = productResult;

  const setQuantity = useCallback(
    (quantity: number) => {
      if (quantity < 0) return;
      const roundedQuantity = roundFloat(quantity);
      updateProductRecords((d) => {
        d[productId].quantity = roundedQuantity;
      });
      return;
    },
    [updateProductRecords, productId, quantity]
  );

  const setPrice = useCallback(
    (price: number) => {
      if (price < 0) return;
      const roundedPrice = roundFloat(price);
      updateProductRecords((d) => {
        d[productId].price_per_unit = roundedPrice;
      });
      return;
    },
    [updateProductRecords, productId, price_per_unit]
  );

  const stepperFunction = useCallback(
    (step: number) =>
      ({
        click: () => {
          if (quantity + step < 0) {
            updateProductRecords((d) => {
              d[productId].quantity = 0;
            });
            return;
          }
          const roundedQuantityStep = roundFloat(quantity + step);
          updateProductRecords((d) => {
            d[productId].quantity = roundedQuantityStep;
          });
          return;
        },
        step,
      } as const),
    [quantity, productId, updateProductRecords]
  );

  if (!isSuccess || !product || !product.steps)
    return {
      steppers: { negative: [], positive: [] },
      setQuantity,
      quantity,
      setPrice,
      price: price_per_unit,
      productResult,
    } as const;

  return {
    steppers: {
      negative: product.steps.map((step) => stepperFunction(-step)),
      positive: product.steps.map((step) => stepperFunction(step)),
    },
    setQuantity,
    quantity,
    setPrice,
    price: price_per_unit,
    productResult,
  } as const;
};
