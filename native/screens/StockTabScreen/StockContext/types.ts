export type ProductRecordsByProductId = {
  [product_id: string]: {
    record_id?: number | null;
    quantity: number;
    price_per_unit: number | null;
  };
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
