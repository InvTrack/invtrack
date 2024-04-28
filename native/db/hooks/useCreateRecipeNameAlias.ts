import { useMutation } from "@tanstack/react-query";
import isEmpty from "lodash/isEmpty";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { AliasForm } from "../../screens/IdentifyAliasesScreen/types";
import { supabase } from "../supabase";
import { NameAliasInsert, NameAliasTable } from "../types";
import { useGetCurrentCompanyId } from "./useGetCurrentCompanyId";

export const useCreateRecipeNameAlias = () => {
  const { showError, showSuccess } = useSnackbar();
  const { data: currentCompanyId } = useGetCurrentCompanyId();
  return useMutation(
    async (recipeNameAliases: AliasForm): Promise<NameAliasTable[] | []> => {
      if (isEmpty(recipeNameAliases)) {
        return [];
      }
      if (currentCompanyId?.id == null) {
        console.error("Company id should be defined, this should not happen");
        return [];
      }
      const company_id = currentCompanyId?.id;

      const mapped = Object.entries(recipeNameAliases).reduce(
        (acc, [recipe_id, aliases]) => {
          if (recipe_id === "usedAliases") {
            return acc;
          }
          return [
            ...acc,
            ...(aliases?.map((alias) => ({
              recipe_id: Number(recipe_id),
              alias: alias,
              company_id,
            })) || []),
          ];
        },
        [] as NameAliasInsert[]
      );

      const { data, error } = await supabase
        .from("name_alias")
        .upsert(mapped, {
          ignoreDuplicates: true,
        })
        .select();

      if (error) {
        console.log("Couldn't insert recipe aliases", error);
        if (error.code === "23505") {
          showError("Niektóre aliasy już istnieją");
          return [];
        }
        showError("Nie udało się dodać nowych aliasów receptur");
        return [];
      }
      showSuccess("Dodano nowe aliasy receptur");
      return data as NonNullable<typeof data>;
    }
  );
};
