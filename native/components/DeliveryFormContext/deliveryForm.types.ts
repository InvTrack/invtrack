export type DeliveryForm = {
  [record_id: string]: {
    quantity: number;
    product_id: number;
    price_per_unit: number | null;
  };
};
