import { useMutation } from "@tanstack/react-query";
import isEmpty from "lodash/isEmpty";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { AliasForm } from "../../screens/IdentifyAliasesScreen";
import { supabase } from "../supabase";
import { ProductNameAliasInsert, ProductNameAliasTable } from "../types";
import { useGetCurrentCompanyId } from "./useGetCurrentCompanyId";

export const useCreateProductNameAlias = () => {
  const { showError, showSuccess } = useSnackbar();
  const { data: currentCompanyId } = useGetCurrentCompanyId();
  return useMutation(
    async (
      productNameAliases: AliasForm
    ): Promise<ProductNameAliasTable[] | []> => {
      if (isEmpty(productNameAliases)) {
        return [];
      }
      if (currentCompanyId?.id == null) {
        console.error("Company id should be defined, this should not happen");
        return [];
      }
      const company_id = currentCompanyId?.id;

      const mapped = Object.entries(productNameAliases).reduce(
        (acc, [product_id, aliases]) => {
          if (product_id === "usedAliases") {
            return acc;
          }
          return [
            ...acc,
            ...(aliases?.map((alias) => ({
              product_id: Number(product_id),
              alias: alias ?? undefined,
              company_id,
            })) || []),
          ];
        },
        [] as ProductNameAliasInsert[]
      );

      const { data, error } = await supabase
        .from("product_name_alias")
        .upsert(mapped, {
          ignoreDuplicates: true,
        })
        .select();

      if (error) {
        console.log("Couldn't insert product aliases", error);
        if (error.code === "23505") {
          showError("Niektóre aliasy już istnieją");
          return [];
        }
        showError("Nie udało się dodać nowych aliasów produktów");
        return [];
      }
      showSuccess("Dodano nowe aliasy produktów");
      return data as NonNullable<typeof data>;
    }
  );
};
