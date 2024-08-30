import { roundFloat } from "../../../utils";
import { ProductRecordsByProductId, RecipeRecordsByRecipeId } from "./types";

// Non-destructive merging of scanner results and raw stock data.
export const mergeRawAndScannedRecords = (
  rawRecipeRecords: RecipeRecordsByRecipeId,
  scannedRecipeRecords: RecipeRecordsByRecipeId,
  rawProductRecords: ProductRecordsByProductId,
  scannedProductRecords: ProductRecordsByProductId,
  recipeList?: {
    id: number;
    recipe_part: { quantity: number; product_id: number }[];
  }[]
) => {
  // Deep copy raw stock data
  const mergedRecipeRecords: RecipeRecordsByRecipeId = JSON.parse(
    JSON.stringify(rawRecipeRecords)
  );
  const mergedProductRecords: ProductRecordsByProductId = JSON.parse(
    JSON.stringify(rawProductRecords)
  );

  // Merge scanned product records
  for (const product_id in scannedProductRecords) {
    const { quantity, price_per_unit } = scannedProductRecords[product_id];
    if (product_id in mergedProductRecords) {
      mergedProductRecords[product_id].quantity =
        mergedProductRecords[product_id].quantity + quantity;
      mergedProductRecords[product_id].price_per_unit = price_per_unit;
    } else {
      mergedProductRecords[product_id] = { quantity, price_per_unit };
    }
  }

  // Merge scanned recipe records
  for (const recipe_id in scannedRecipeRecords) {
    const { quantity } = scannedRecipeRecords[recipe_id];
    if (recipe_id in mergedRecipeRecords) {
      mergedRecipeRecords[recipe_id].quantity =
        mergedRecipeRecords[recipe_id].quantity + quantity;
    } else {
      mergedRecipeRecords[recipe_id] = { quantity, record_id: null };
    }

    // Adjust merged product records according to scanned recipe records
    const recipeParts = recipeList?.find(
      (r) => r.id.toString() === recipe_id
    )?.recipe_part;
    if (!recipeParts || quantity === 0) break;

    recipeParts.forEach((part) => {
      const product_id = part.product_id;
      const dMultiplied = roundFloat(quantity * part.quantity);
      if (product_id in mergedProductRecords) {
        const oldQuantity = mergedProductRecords[product_id].quantity;
        const newRecordQuantity = roundFloat(oldQuantity - dMultiplied);
        mergedProductRecords[product_id].quantity = newRecordQuantity;
      } else {
        mergedProductRecords[product_id] = {
          quantity: dMultiplied,
          price_per_unit: null,
        };
      }
    });
  }

  return { mergedProductRecords, mergedRecipeRecords };
};
