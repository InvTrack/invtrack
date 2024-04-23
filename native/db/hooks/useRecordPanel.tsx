import { useCallback, useEffect } from "react";

import { useFormContext } from "react-hook-form";
import { StockForm } from "../../components/StockFormContext/types";
import { roundFloat } from "../../utils";
import { useGetRecord } from "./useGetRecord";
type Form = StockForm;
/**
 * This hook simplifies the process of populating the form with the backend data.
 * Registers the records as needed, returns values needed to manipulate the form in a safe way.
 *
 * Submitting the form is done in a separate hook.
 */
export const useRecordPanel = (recordId: number) => {
  const recordResult = useGetRecord(recordId);
  const form = useFormContext<Form>();
  if (!form) throw new Error("Missing form context");

  const { data: record, isSuccess } = recordResult;

  useEffect(() => {
    // guard would be cleaner but for some reason it doesn't work here
    // no idea why
    if (record?.product_id && record?.quantity) {
      const shouldAddMissingValues =
        // is nullish
        form.getValues().product_records[recordId.toString()]?.product_id ==
        null;

      if (shouldAddMissingValues) {
        form.setValue(
          `product_records.${recordId.toString()}.product_id`,
          record.product_id
        );
      }

      const shouldUpdateQuantity =
        !form.getFieldState(`product_records.${recordId.toString()}.quantity`)
          .isDirty ||
        record.quantity !==
          form.getValues().product_records[recordId.toString()]?.quantity;

      if (shouldUpdateQuantity) {
        form.setValue(
          `product_records.${recordId.toString()}.quantity`,
          record.quantity
        );
      }
      const shouldUpdatePrice =
        !form.getFieldState(
          `product_records.${recordId.toString()}.price_per_unit`
        ).isDirty ||
        record.price_per_unit !==
          form.getValues().product_records[recordId.toString()]?.price_per_unit;

      if (shouldUpdatePrice) {
        form.setValue(
          `product_records.${recordId.toString()}.price_per_unit`,
          record.price_per_unit
        );
      }
    }
  }, [
    recordId,
    record?.product_id,
    record?.quantity,
    record?.price_per_unit,
    isSuccess,
  ]);

  const quantity =
    form.watch(`product_records.${recordId.toString()}.quantity`) ?? 0;
  const price =
    form.watch(`product_records.${recordId.toString()}.price_per_unit`) ?? 0;

  const setQuantity = useCallback(
    (quantity: number) => {
      if (quantity < 0) return;
      const roundedQuantity = roundFloat(quantity);
      // dot notation is more performant
      form.setValue(
        `product_records.${recordId.toString()}.quantity`,
        roundedQuantity,
        {
          shouldDirty: true,
          shouldTouch: true,
        }
      );
      return;
    },
    [form, recordId, quantity]
  );

  const setPrice = useCallback(
    (price: number) => {
      if (price < 0) return;
      const roundedPrice = roundFloat(price);
      // dot notation is more performant
      form.setValue(
        `product_records.${recordId.toString()}.price_per_unit`,
        roundedPrice,
        {
          shouldDirty: true,
          shouldTouch: true,
        }
      );
      return;
    },
    [form, recordId, price]
  );

  const stepperFunction = useCallback(
    (step: number) =>
      ({
        click: () => {
          if (quantity + step < 0) {
            form.setValue(
              // dot notation is more performant
              `product_records.${recordId.toString()}.quantity`,
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
            `product_records.${recordId.toString()}.quantity`,
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
    [quantity, recordId, form]
  );

  if (!isSuccess || !record || !record.steps)
    return {
      steppers: { negative: [], positive: [] },
      setQuantity,
      quantity,
      setPrice,
      price,
      ...recordResult,
    } as const;

  return {
    steppers: {
      negative: record.steps.map((step) => stepperFunction(-step)),
      positive: record.steps.map((step) => stepperFunction(step)),
    },
    setQuantity,
    quantity,
    setPrice,
    price,
    ...recordResult,
  } as const;
};
