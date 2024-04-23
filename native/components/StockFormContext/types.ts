export type StockForm = {
  product_records: {
    [record_id: string]: {
      quantity: number;
      product_id: number;
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
