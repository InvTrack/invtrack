import React, { useEffect } from "react";
import { View } from "react-native";

import { useNetInfo } from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Collapsible } from "../../components/Collapsible/Collapsible";
import { DocumentScannerIcon, ScanBarcodeIcon } from "../../components/Icon";
import { Skeleton } from "../../components/Skeleton";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { Button } from "../../components/common/Button";
import { Typography } from "../../components/common/Typography";
import { useCreateProductNameAlias } from "../../db/hooks/useCreateProductNameAlias";
import { useCreateRecipeNameAlias } from "../../db/hooks/useCreateRecipeNameAlias";
import { useGetInventoryName } from "../../db/hooks/useGetInventoryName";
import { useListRecipesWithRecords } from "../../db/hooks/useListRecipes";
import { useUpdateRecords } from "../../db/hooks/useUpdateRecords";
import { StockTabScreenProps } from "../../navigation/types";
import { IDListCard, IDListCardHeader } from "./IDListCard/IDListCard";
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

  const { recordsFromInvoice, aliasForm } = route.params;

  // const { showError, showInfo, showSuccess } = useSnackbar();
  const { showError, showSuccess } = useSnackbar();

  const { data: inventoryName } = useGetInventoryName(stockId);

  const {
    productRecords,
    recipeRecords,
    // setRecipeQuantityWithProductQuantities,
    // setProductRecord,
    setStockId,
    unsavedChanges,
  } = useStockContext();

  // useEffect(() => {
  //   if (!!recordsFromInvoice) {
  //     for (const product_id in recordsFromInvoice) {
  //       if (product_id in productRecords) {
  //         const { quantity, price_per_unit } = recordsFromInvoice[product_id];
  //         setProductRecord(parseInt(product_id), {
  //           quantity: productRecords[product_id].quantity + quantity,
  //           price_per_unit,
  //         });
  //       } else {
  //         setProductRecord(
  //           parseInt(product_id),
  //           recordsFromInvoice[product_id]
  //         );
  //       }
  //     }
  //   }
  // }, [recordsFromInvoice]);

  // useEffect(() => {
  //   if (!!recordsFromSalesRaport) {
  //     for (const recipe_id in recordsFromSalesRaport) {
  //       // if (recipe_id in recipeRecords) {
  //       //   const { quantity } = recordsFromSalesRaport[recipe_id];
  //       //   setProductRecord(parseInt(recipe_id), {
  //       //     quantity: recipeRecords[recipe_id].quantity + quantity,
  //       //   });
  //       // } else {
  //       //   setRecipeQuantityWithProductQuantities(parseInt(recipe_id))(
  //       //     recordsFromSalesRaport[recipe_id].quantity
  //       //   );
  //       // }
  //       setRecipeQuantityWithProductQuantities(parseInt(recipe_id))(
  //         recordsFromSalesRaport[recipe_id].quantity
  //       );
  //     }
  //   }
  // }, [recordsFromSalesRaport]);

  useEffect(() => {
    setStockId(stockId);
  }, [stockId]);

  const {
    // productsIsSuccess,
    categorizedIsSuccess,
    // categorizedProducts,
    // uncategorizedProducts,
    allProducts,
  } = useProductRecords();

  const { data: recipeList, isSuccess: recipesIsSuccess } =
    useListRecipesWithRecords(stockId);

  // const { data: products, isSuccess: productsIsSuccess } =
  //   useListExistingProducts();

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

  // const documents = [3, -1].map((d) =>
  //   Object.fromEntries(
  //     allProducts.map((p) => [p.id, false ? null : p.quantity * d])
  //   )
  // );
  const documents = [recordsFromInvoice].filter((x) => !!x);

  // console.log(recordsFromInvoice, recordsFromSalesRaport);

  if (
    // !productsIsSuccess ||
    !categorizedIsSuccess ||
    !stockId ||
    !recipesIsSuccess
  )
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.screen}>
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
          <View style={styles.scroll}>
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
                testID="documentScanner"
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
                disabled={!isConnected || !unsavedChanges}
              >
                {unsavedChanges ? "Zapisz zmiany" : "Brak zmian do zapisania"}
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
            {/* <IDListCardAddProduct inventoryId={stockId} /> */}
            {/* <IDListCardAddRecord inventoryId={stockId} /> */}
            {/* <Button type="primary" size="l" fullWidth>
              {recordsFromInvoice
                ? Object.keys(recordsFromInvoice).toString()
                : "No invoice"}
            </Button> */}
            {stockType === "inventory" ? (
              <>
                <Typography
                  variant="lBold"
                  color="lightGrey"
                  style={styles.sectionHeader}
                >
                  Ubyło dań:
                </Typography>
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
              </>
            ) : null}
            <Typography
              variant="lBold"
              color="lightGrey"
              style={styles.sectionHeader}
            >
              Produkty:
            </Typography>
            <IDListCardHeader documents={documents} />
            {allProducts?.map((product) =>
              product && product.id ? (
                <IDListCard
                  key={product.id}
                  recordId={product.record_id!}
                  productId={product.id!}
                  inventoryId={stockId}
                  id={+stockId}
                  quantity={product.quantity}
                  documents={documents.map((d) =>
                    d && product.id in d ? d[product.id].quantity : null
                  )}
                  unit={product.unit!}
                  name={product.name}
                />
              ) : (
                <></>
              )
            )}
          </View>
        }
        sections={
          []
          //   categorizedProducts?.map((category, i) => ({
          //   id: i + 1,
          //   title: category.name,
          //   data: category.products.map((product, j) =>
          //     product && product.id ? (
          //       <IDListCard
          //         key={product.id}
          //         recordId={product.record_id!}
          //         productId={product.id!}
          //         inventoryId={stockId}
          //         id={+stockId}
          //         quantity={product.quantity}
          //         documents={[]}
          //         unit={product.unit!}
          //         name={product.name}
          //         borderBottom={category.products.length === j + 1}
          //         borderLeft
          //         borderRight
          //       />
          //     ) : (
          //       <></>
          //     )
          //   ),
          // }))
        }
      />
    </SafeAreaView>
  );
}
