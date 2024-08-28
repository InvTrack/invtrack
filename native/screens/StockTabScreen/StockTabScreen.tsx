import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";

import { useNetInfo } from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Collapsible } from "../../components/Collapsible/Collapsible";
import { DocumentScannerIcon, ScanBarcodeIcon } from "../../components/Icon";
import { Skeleton } from "../../components/Skeleton";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { Button } from "../../components/common/Button";
import { useCreateProductNameAlias } from "../../db/hooks/useCreateProductNameAlias";
import { useCreateRecipeNameAlias } from "../../db/hooks/useCreateRecipeNameAlias";
import { useGetInventoryName } from "../../db/hooks/useGetInventoryName";
import { useListRecipesWithRecords } from "../../db/hooks/useListRecipes";
import { useUpdateRecords } from "../../db/hooks/useUpdateRecords";
import { StockTabScreenProps } from "../../navigation/types";
import { IDListCard } from "./IDListCard/IDListCard";
import { IDListCardAddProduct } from "./IDListCard/IDListCardAddProduct";
import { IDListCardAddRecord } from "./IDListCard/IDListCardAddRecord";
import { RecipeCard } from "./RecipeCard";
import { useStockContext } from "./StockContext/StockContextProvider";
import { useStockTabStyles } from "./styles";
import { useProductRecords } from "./useProductRecords";

export default function StockTabScreen({
  route,
  navigation,
}: StockTabScreenProps) {
  const styles = useStockTabStyles();

  const { isConnected } = useNetInfo();
  const stockId = route.params?.id;
  const stockType = route.params?.stockType;

  const { recordsFromInvoice, recordsFromSalesRaport, aliasForm } =
    route.params;

  // const { showError, showInfo, showSuccess } = useSnackbar();
  const { showError, showSuccess } = useSnackbar();

  const { data: inventoryName } = useGetInventoryName(+stockId);

  const {
    productRecords,
    recipeRecords,
    setRecordsFromInvoice,
    setRecordsFromSalesRaport,
    setStockId,
  } = useStockContext();

  useEffect(() => {
    if (!!recordsFromInvoice) setRecordsFromInvoice(recordsFromInvoice);
  }, [recordsFromInvoice]);

  useEffect(() => {
    if (!!recordsFromSalesRaport)
      setRecordsFromSalesRaport(recordsFromSalesRaport);
  }, [recordsFromSalesRaport]);

  useEffect(() => {
    setStockId(stockId);
  }, [stockId]);

  const {
    productsIsSuccess,
    categorizedIsSuccess,
    categorizedProducts,
    uncategorizedProducts,
  } = useProductRecords();

  const { data: recipeList, isSuccess: recipesIsSuccess } =
    useListRecipesWithRecords(stockId);

  const {
    mutate,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
  } = useUpdateRecords(+stockId);
  const { mutate: createProductNameAliases } = useCreateProductNameAlias();
  const { mutate: createRecipeNameAliases } = useCreateRecipeNameAlias();

  useEffect(() => {
    navigation.setOptions({ headerTitle: inventoryName });
  }, [stockId, inventoryName, navigation]);

  useEffect(() => {
    if (isUpdateSuccess) {
      showSuccess("Zmiany zostały zapisane");
      return;
    }
    if (isUpdateError) {
      showError("Nie udało się zapisać zmian");
      return;
    }
  }, [isUpdateSuccess, isUpdateError]);

  if (
    !productsIsSuccess ||
    !categorizedIsSuccess ||
    !stockId ||
    !recipesIsSuccess
  )
    return (
      <SafeAreaView edges={["left", "right"]}>
        <View style={styles.scroll}>
          <View style={styles.skeletonDate}></View>
          <View style={styles.barcodeIconContainer}>
            <Skeleton borderRadius={999} style={styles.skeletonButton} />
          </View>
          <Skeleton style={styles.skeletonListItem} />
          <Skeleton style={styles.skeletonListItem} />
          <Skeleton style={styles.skeletonListItem} />
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView edges={["left", "right"]}>
      <Collapsible
        ListHeaderComponent={
          <ScrollView style={styles.scroll}>
            <View style={styles.doubleButtonContainer}>
              <Button
                containerStyle={styles.barcodeIconContainer}
                size="l"
                type="primary"
                onPress={() => {
                  // necessary hack, handled by parent navigator - be cautious
                  navigation.navigate("DocumentScannerModal" as any, {
                    stockId: stockId,
                    stockType,
                  });
                }}
              >
                <DocumentScannerIcon size={34} color="lightGrey" />
              </Button>
              <Button
                containerStyle={styles.saveButtonContainer}
                size="l"
                type="primary"
                fullWidth
                labelStyle={styles.saveButtonLabel}
                onPress={() => {
                  mutate({ productRecords, recipeRecords });
                  if (aliasForm) {
                    createProductNameAliases(aliasForm);
                    createRecipeNameAliases(aliasForm);
                  }
                }}
                disabled={!isConnected}
              >
                Zapisz zmiany
              </Button>
              <Button
                containerStyle={styles.barcodeIconContainer}
                size="l"
                type="primary"
                disabled
                onPress={() => {
                  // necessary hack, handled by parent navigator - be cautious
                  navigation.navigate("BarcodeModal" as any, {
                    inventoryId: stockId,
                    navigateTo: "StockTab",
                  });
                }}
              >
                <ScanBarcodeIcon size={34} color="lightGrey" />
              </Button>
            </View>
            <IDListCardAddProduct inventoryId={stockId} />
            <IDListCardAddRecord inventoryId={stockId} />
            {/* <Button type="primary" size="l" fullWidth>
              {recordsFromInvoice
                ? Object.keys(recordsFromInvoice).toString()
                : "No invoice"}
            </Button> */}
            {recipeList?.map((recipe) => (
              <RecipeCard
                key={recipe?.id}
                inventoryId={stockId}
                name={recipe.name}
                recipePart={recipe.recipe_part}
                recipeId={recipe.id}
                recipeRecordId={recipe.recipe_record?.[0]?.id}
              />
            ))}
            {uncategorizedProducts?.map((product) =>
              product && product.id ? (
                <IDListCard
                  key={product.id}
                  recordId={product.record_id!}
                  productId={product.id!}
                  inventoryId={stockId}
                  id={+stockId}
                  quantity={product.quantity}
                  unit={product.unit!}
                  name={product.name}
                />
              ) : (
                <></>
              )
            )}
          </ScrollView>
        }
        sections={categorizedProducts?.map((category, i) => ({
          id: i + 1,
          title: category.name,
          data: category.products.map((product, j) =>
            product && product.id ? (
              <IDListCard
                key={product.id}
                recordId={product.record_id!}
                productId={product.id!}
                inventoryId={stockId}
                id={+stockId}
                quantity={product.quantity}
                unit={product.unit!}
                name={product.name}
                borderBottom={category.products.length === j + 1}
                borderLeft
                borderRight
              />
            ) : (
              <></>
            )
          ),
        }))}
      />
    </SafeAreaView>
  );
}
