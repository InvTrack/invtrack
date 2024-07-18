type ProductRecordByProductId = {
  record_id: number | null;
  quantity: number;
  price_per_unit: number | null;
};

export type ProductRecordsByProductId = {
  [product_id: string]: ProductRecordByProductId;
};

type RecipeRecordByRecipeId = {
  // record_id: number | null;
  quantity: number;
};

export type RecipeRecordsByRecipeId = {
  [recipe_id: string]: RecipeRecordByRecipeId;
};

export type StockData = {
  //   stockId: number;
  //   stockType: "inventory" | "delivery";
  productRecords: ProductRecordsByProductId;
  recipeRecords: RecipeRecordsByRecipeId;
};
