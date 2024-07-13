import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { StockForm } from "../../components/StockFormContext/types";
import { roundFloat } from "../../utils";
import { useGetProduct } from "./useGetProduct";

type Form = StockForm;
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
  const form = useFormContext<Form>();
  if (!form) throw new Error("Missing form context");

  const productResult = useGetProduct(productId);
  const { data: product, isSuccess } = productResult;

  const quantity = form.watch(`product_records.${productId}.quantity`) ?? 0;
  const price = form.watch(`product_records.${productId}.price_per_unit`) ?? 0;

  const setQuantity = useCallback(
    (quantity: number) => {
      if (quantity < 0) return;
      const roundedQuantity = roundFloat(quantity);
      // dot notation is more performant
      form.setValue(`product_records.${productId}.quantity`, roundedQuantity, {
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    },
    [form, productId, quantity]
  );

  const setPrice = useCallback(
    (price: number) => {
      if (price < 0) return;
      const roundedPrice = roundFloat(price);
      // dot notation is more performant
      form.setValue(
        `product_records.${productId}.price_per_unit`,
        roundedPrice,
        {
          shouldDirty: true,
          shouldTouch: true,
        }
      );
      return;
    },
    [form, productId, price]
  );

  const stepperFunction = useCallback(
    (step: number) =>
      ({
        click: () => {
          if (quantity + step < 0) {
            form.setValue(
              // dot notation is more performant
              `product_records.${productId}.quantity`,
              0,
              {
                shouldDirty: true,
                shouldTouch: true,
              }
            );
            return;
          }
          const roundedQuantityStep = roundFloat(quantity + step);
          form.setValue(
            // dot notation is more performant
            `product_records.${productId}.quantity`,
            roundedQuantityStep,
            {
              shouldDirty: true,
              shouldTouch: true,
            }
          );
          return;
        },
        step,
      } as const),
    [quantity, productId, form]
  );

  if (!isSuccess || !product || !product.steps)
    return {
      steppers: { negative: [], positive: [] },
      setQuantity,
      quantity,
      setPrice,
      price,
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
    price,
    productResult,
  } as const;
};
