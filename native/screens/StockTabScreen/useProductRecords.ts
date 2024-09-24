import { useListExistingProducts } from "../../db/hooks/useListProducts";
import { useListProductsCategorized } from "../../db/hooks/useListProductsCategorized";
import { useStockContext } from "./StockContext/StockContextProvider";

export const useProductRecords = () => {
  const { productRecords } = useStockContext();

  const productsResponse = useListExistingProducts();
  const { data: products, isSuccess: productsIsSuccess } = productsResponse;
  const uncategorizedProducts =
    products
      ?.filter((p) => p.category_id === null && productRecords[p.id])
      .map((p) => ({
        ...productRecords[p.id],
        ...p,
        record_id: productRecords[p.id].record_id,
      })) || [];

  const { data: categories, isSuccess: categorizedIsSuccess } =
    useListProductsCategorized();
  const categorizedProducts = categories.map((c) => ({
    name: c.name,
    display_order: c.display_order,
    products: c.existing_products
      .filter((p) => p.id in productRecords)
      .map((p) => ({
        ...productRecords[p.id],
        ...p,
        record_id: productRecords[p.id].record_id,
      })),
  }));

  const allProducts =
    products?.map((p) => ({
      ...productRecords[p.id],
      ...p,
      record_id: p.id in productRecords ? productRecords[p.id].record_id : null,
    })) || [];

  return {
    uncategorizedProducts,
    categorizedProducts,
    productsIsSuccess,
    categorizedIsSuccess,
    allProducts,
  };
};
