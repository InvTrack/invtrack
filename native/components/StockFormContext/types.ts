export type StockForm = {
  product_records: {
    [product_id: string]: {
      id: number | null;
      // product_id: number;
      quantity: number;
      price_per_unit: number | null;
    };
  };
  recipe_records: {
    [record_id: string]: {
      quantity: number;
      recipe_id: number;
    };
  };
};
