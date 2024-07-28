import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";

import { useNetInfo } from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Collapsible } from "../../components/Collapsible/Collapsible";
import { DocumentScannerIcon, ScanBarcodeIcon } from "../../components/Icon";
import { Skeleton } from "../../components/Skeleton";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { Button } from "../../components/common/Button";
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
  const inventoryId = route.params?.id;
  const stockType = route.params?.stockType;

  const recordsFromInvoice = route.params.recordsFromInvoice;
  // console.log({ recordsFromInvoice });

  // const { showError, showInfo, showSuccess } = useSnackbar();
  const { showError, showSuccess } = useSnackbar();

  const { data: inventoryName } = useGetInventoryName(+inventoryId);

  useEffect(() => {
    if (!!recordsFromInvoice) setRecordsFromInvoice(recordsFromInvoice);
  }, [recordsFromInvoice]);

  const { productRecords, setRecordsFromInvoice } = useStockContext();
  // console.log({ productRecords });

  const {
    productsIsSuccess,
    categorizedIsSuccess,
    categorizedProducts,
    uncategorizedProducts,
  } = useProductRecords();

  // console.log({
  //   x: categorizedProducts.map((c) => c.products),
  //   uncategorizedProducts,
  // });

  const { data: recipeList, isSuccess: recipesIsSuccess } =
    useListRecipesWithRecords(inventoryId);

  const {
    mutate,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
  } = useUpdateRecords(+inventoryId);

  useEffect(() => {
    navigation.setOptions({ headerTitle: inventoryName });
  }, [inventoryId, inventoryName, navigation]);

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
    !inventoryId ||
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
                    // WIP
                    isScanningSalesRaport: false,
                    stockId: inventoryId,
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
                  mutate({ productRecords, recipeRecords: {} });
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
                    inventoryId,
                    navigateTo: "StockTab",
                  });
                }}
              >
                <ScanBarcodeIcon size={34} color="lightGrey" />
              </Button>
            </View>
            <IDListCardAddProduct inventoryId={inventoryId} />
            <IDListCardAddRecord inventoryId={inventoryId} />
            {/* <Button type="primary" size="l" fullWidth>
              {recordsFromInvoice
                ? Object.keys(recordsFromInvoice).toString()
                : "No invoice"}
            </Button> */}
            {recipeList?.map((recipe) => (
              <RecipeCard
                key={recipe?.id}
                inventoryId={inventoryId}
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
                  inventoryId={inventoryId}
                  id={+inventoryId}
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
                inventoryId={inventoryId}
                id={+inventoryId}
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
