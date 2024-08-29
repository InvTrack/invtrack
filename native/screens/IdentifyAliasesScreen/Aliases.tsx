import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import isEmpty from "lodash/isEmpty";
import { UseFormGetValues, UseFormSetValue, useForm } from "react-hook-form";
import { View } from "react-native";
import { useBottomSheet } from "../../components/BottomSheet";
import { ProductListBottomSheetContent } from "../../components/BottomSheet/contents/ProductList";
import { DropdownButton } from "../../components/DropdownButton";
import { IndexBadge } from "../../components/IndexBadge";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyScreenTemplate } from "../../components/common/EmptyScreenTemplate";
import { Typography } from "../../components/common/Typography";
import { useListExistingProducts } from "../../db/hooks/useListProducts";
import { useListRecipes } from "../../db/hooks/useListRecipes";
import {
  ProcessInvoiceResponse,
  ProcessSalesRaportResponse,
} from "../../db/types";
import { IdentifyAliasesScreenNavigationProp } from "../../navigation/types";
import { IDListCardAddProduct } from "../StockTabScreen/IDListCard/IDListCardAddProduct";
import {
  ProductRecordsByProductId,
  RecipeRecordsByRecipeId,
} from "../StockTabScreen/StockContext/types";
import { useAliasesStyles } from "./styles";
import { AliasForm } from "./types";

// unique
const aliasSet = new Set<string>([]);
const setAlias =
  (
    setValue: UseFormSetValue<AliasForm>,
    getValues: UseFormGetValues<AliasForm>,
    showInfo: ReturnType<typeof useSnackbar>["showInfo"],
    entityType: "product" | "recipe"
  ) =>
  (entityId: string, alias: string) => {
    if (entityType === "product") {
      const productAliases = getValues(`productAliases.${entityId}`);
      if (aliasSet.has(alias)) {
        const entireFormValues = getValues();
        for (const product_id in entireFormValues) {
          if (
            entireFormValues.productAliases[product_id]?.some(
              (usedAlias) => usedAlias === alias
            )
          ) {
            setValue(`productAliases.${product_id}`, [
              ...(productAliases?.filter((ua) => ua === alias) || []),
              alias,
            ]);
            showInfo(
              "Alias został już ustalony dla innego produktu, nadpisano."
            );
            return void this;
          }
        }
        return void this;
      }
      setValue(`productAliases.${entityId}`, [
        ...(productAliases || []),
        alias,
      ]);
      aliasSet.add(alias);
      setValue("usedAliases", [...aliasSet]);
    } else if (entityType === "recipe") {
      const recipeAliases = getValues(`recipeAliases.${entityId}`);
      if (aliasSet.has(alias)) {
        const entireFormValues = getValues();
        for (const recipe_id in entireFormValues) {
          if (
            entireFormValues.recipeAliases[recipe_id]?.some(
              (usedAlias) => usedAlias === alias
            )
          ) {
            setValue(`recipeAliases.${recipe_id}`, [
              ...(recipeAliases?.filter((ua) => ua === alias) || []),
              alias,
            ]);
            showInfo(
              "Alias został już ustalony dla innego produktu, nadpisano."
            );
            return void this;
          }
        }
        return void this;
      }
      setValue(`recipeAliases.${entityId}`, [...(recipeAliases || []), alias]);
      aliasSet.add(alias);
      setValue("usedAliases", [...aliasSet]);
    }
  };

// TODO merge these two
const getNewMatchedProducts = (
  documentResponse: ProcessInvoiceResponse,
  productAliases: AliasForm["productAliases"],
  products: { id: number }[]
) => {
  if (!documentResponse) return null;
  let newMatched: ProductRecordsByProductId = {};

  for (const row of documentResponse.unmatchedRows) {
    const { price_per_unit, quantity, name } = row;

    const product_id = Object.entries(productAliases).find(
      ([_, aliases]) => !!aliases?.find((alias) => alias === name)
    )?.[0];

    if (!product_id) continue;

    const product = products?.find((p) => p.id === parseInt(product_id));
    if (!product || !product.id) continue;

    newMatched[product.id] = {
      price_per_unit,
      quantity,
      record_id: null,
    };
  }
  return newMatched;
};

const getNewMatchedRecipes = (
  documentResponse: ProcessSalesRaportResponse,
  recipeAliases: AliasForm["recipeAliases"],
  recipes: { id: number }[]
) => {
  if (!documentResponse) return null;
  let newMatched: RecipeRecordsByRecipeId = {};

  for (const row of documentResponse.unmatchedRows) {
    const { quantity, name } = row;

    const recipe_id = Object.entries(recipeAliases).find(
      ([_, aliases]) => !!aliases?.find((alias) => alias === name)
    )?.[0];

    if (!recipe_id) continue;

    const recipe = recipes?.find((p) => p.id === parseInt(recipe_id));
    if (!recipe || !recipe.id) continue;

    newMatched[recipe.id] = {
      quantity,
      record_id: null,
    };
  }
  return newMatched;
};

export const IdentifyAliasesComponent = ({
  documentResponse,
  stockId,
  stockType,
}:
  | {
      documentResponse: ProcessInvoiceResponse;
      stockId: number;
      stockType: "delivery";
    }
  | {
      documentResponse: ProcessSalesRaportResponse;
      stockId: number;
      stockType: "inventory";
    }) => {
  const navigation = useNavigation<IdentifyAliasesScreenNavigationProp>();
  // const navigation = useNavigation<StockTabNavigationProp>();
  const { isConnected } = useNetInfo();
  const styles = useAliasesStyles();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const { showInfo } = useSnackbar();
  // const {
  //   mutate,
  //   isSuccess,
  //   data: resolvedAliases,
  // } = useCreateProductNameAlias();

  const unmatchedRows = documentResponse?.unmatchedRows;

  // const { data: productRecords } = useListProductRecords(stockId);
  const { data: products } = useListExistingProducts();

  const { data: recipes } = useListRecipes();

  // const [newMatched, setNewMatched] = useState< typeof documentResponse.matchedProductRecords>({});

  const { setValue, handleSubmit, watch, getValues } = useForm<AliasForm>({
    defaultValues: async () => ({
      productAliases: !!products
        ? products.reduce(
            (acc, { id: product_id }) => ({
              ...acc,
              [String(product_id)]: null,
            }),
            {}
          )
        : {},
      recipeAliases: !!recipes
        ? recipes.reduce(
            (acc, { id: recipe_id }) => ({
              ...acc,
              [String(recipe_id)]: null,
            }),
            {}
          )
        : {},
      usedAliases: [],
    }),
  });

  const usedAliases = watch("usedAliases");

  const handleSavePress = () => {
    handleSubmit(
      (data) => {
        // WIP
        if (stockType === "delivery" && products && documentResponse) {
          const newMatchedProducts = getNewMatchedProducts(
            documentResponse,
            data.productAliases,
            products
          );

          const merged: ProductRecordsByProductId = {
            ...documentResponse.matchedProductsNotInInventory,
            ...documentResponse.matchedProductRecords,
            // order is important, newMatchedProducts should be last, because it is the result of the user selection
            // or is it?
            ...newMatchedProducts,
          };

          // "necessery hack"? idk how navigation works
          navigation.navigate("StockTabScreen" as any, {
            id: stockId,
            stockType,
            recordsFromInvoice: merged,
            aliasForm: getValues(),
          });
        }
        if (stockType === "inventory" && recipes && documentResponse) {
          const newMatchedRecipes = getNewMatchedRecipes(
            documentResponse,
            data.recipeAliases,
            recipes
          );

          const merged: RecipeRecordsByRecipeId = {
            ...documentResponse.matchedRecipieRecords,
            ...documentResponse.matchedRecipiesNotInInventory,
            // order is important, newMatchedProducts should be last, because it is the result of the user selection
            // or is it?
            ...newMatchedRecipes,
          };

          // "necessery hack"? idk how navigation works
          navigation.navigate("StockTabScreen" as any, {
            id: stockId,
            stockType,
            recordsFromSalesRaport: merged,
            aliasForm: getValues(),
          });
        }
      },
      (_errors) => {
        // TODO show a snackbar? handle error better
        console.log("error", _errors);
      }
    )();
  };

  if (isEmpty(unmatchedRows) || !unmatchedRows) {
    // error
    return (
      <EmptyScreenTemplate>
        <Typography variant="l" color="lightGrey" align="center">
          Błąd - brak aliasów do wyświetlenia.
        </Typography>
        <Button
          size="l"
          type="primary"
          fullWidth
          onPress={() => {
            navigation.goBack();
          }}
          containerStyle={{ marginTop: 16 }}
        >
          Resetuj skaner
        </Button>
      </EmptyScreenTemplate>
    );
  }
  return (
    <>
      <View style={{ flexDirection: "row" }}>
        <Button
          containerStyle={styles.saveButtonContainer}
          size="l"
          type="primary"
          fullWidth
          onPress={() =>
            navigation.replace("DocumentScannerModal", {
              stockId,
              stockType,
            })
          }
        >
          Wróć do skanera
        </Button>
        <Button
          containerStyle={styles.saveButtonContainer}
          size="l"
          type="primary"
          fullWidth
          onPress={handleSavePress}
          disabled={!isConnected}
        >
          Zapisz zmiany
        </Button>
      </View>
      <IDListCardAddProduct inventoryId={stockId} />
      {unmatchedRows.map((row, i) => (
        <View key={i}>
          <Badge
            containerStyle={styles.checkmarkBadgePosition}
            isShown={usedAliases?.includes(row.name)}
          />
          <IndexBadge
            containerStyle={styles.indexBadgePosition}
            index={i + 1}
          />
          <DropdownButton
            containerStyle={styles.dropdown}
            onPress={() =>
              openBottomSheet(() => (
                <ProductListBottomSheetContent
                  products={stockType === "delivery" ? products! : recipes!}
                  // products={recipes!}
                  alias={row.name}
                  closeBottomSheet={closeBottomSheet}
                  setValue={setAlias(
                    setValue,
                    getValues,
                    showInfo,
                    stockType === "delivery" ? "product" : "recipe"
                  )}
                />
              ))
            }
          >
            <Typography
              color="lightGrey"
              numberOfLines={2}
              variant={row.name.length > 50 ? "xs" : "s"}
            >
              {row.name}
            </Typography>
          </DropdownButton>
        </View>
      ))}
    </>
  );
};
