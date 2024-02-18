import { useCallback, useEffect } from "react";

import isEmpty from "lodash/isEmpty";
import { useFormContext } from "react-hook-form";
import { DeliveryForm } from "../../components/DeliveryFormContext/deliveryForm.types";
import { InventoryForm } from "../../components/InventoryFormContext/inventoryForm.types";
import { useGetRecord } from "./useGetRecord";

/**
 * This hook simplifies the process of populating the form with the backend data.
 * Registers the records as needed, returns values needed to manipulate the form in a safe way.
 *
 * Submitting the form is done in a separate hook.
 */
export const useRecordPanel = (recordId: number) => {
  const recordResult = useGetRecord(recordId);
  const form = useFormContext<DeliveryForm | InventoryForm>();
  if (!form) throw new Error("Missing form context");

  const { data: record, isSuccess } = recordResult;

  useEffect(() => {
    // guard would be cleaner but for some reason it doesn't work here
    // no idea why
    if (record?.product_id && record?.quantity) {
      const shouldRegister = isEmpty(form.getValues()[recordId.toString()]);
      if (shouldRegister) {
        // set the new values
        form.register(recordId.toString(), {
          value: {
            quantity: record.quantity,
            product_id: record.product_id,
          },
        });
      }

      const shouldAddMissingValues =
        // is nullish
        form.getValues()[recordId.toString()]?.product_id == null;

      if (shouldAddMissingValues) {
        form.setValue(`${recordId.toString()}.product_id`, record.product_id);
      }

      const shouldUpdateQuantity =
        record.quantity !== form.getValues()[recordId.toString()]?.quantity &&
        !form.getFieldState(`${recordId.toString()}.quantity`).isDirty;

      if (shouldUpdateQuantity) {
        form.setValue(`${recordId.toString()}.quantity`, record.quantity);
      }
    }
  }, [recordId, record?.product_id, record?.quantity, isSuccess]);

  const quantity = form.watch(`${recordId.toString()}.quantity`) ?? 0;

  const setQuantity = useCallback(
    (quantity: number) => {
      if (quantity < 0) return;
      // dot notation is more performant
      form.setValue(`${recordId.toString()}.quantity`, quantity, {
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    },
    [form, recordId, quantity]
  );
  const stepperFunction = useCallback(
    (step: number) =>
      ({
        click: () => {
          if (quantity + step < 0) {
            form.setValue(
              // dot notation is more performant
              `${recordId.toString()}.quantity`,
              0,
              {
                shouldDirty: true,
                shouldTouch: true,
              }
            );
            return;
          }
          form.setValue(
            // dot notation is more performant
            `${recordId.toString()}.quantity`,
            (quantity as number) + step,
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
      ...recordResult,
    } as const;

  return {
    steppers: {
      negative: record.steps.map((step) => stepperFunction(-step)),
      positive: record.steps.map((step) => stepperFunction(step)),
    },
    setQuantity,
    quantity,
    ...recordResult,
  } as const;
};
