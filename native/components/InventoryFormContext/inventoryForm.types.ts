export type InventoryForm = {
  [record_id: string]: {
    quantity: number;
    product_id: number;
  };
};
