import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useNetInfo } from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { Collapsible } from "../components/Collapsible/Collapsible";
import { IDListCard } from "../components/IDListCard";
import { IDListCardAddProduct } from "../components/IDListCardAddProduct";
import { IDListCardAddRecord } from "../components/IDListCardAddRecord";
import { DocumentScannerIcon, ScanBarcodeIcon } from "../components/Icon";
import { Skeleton } from "../components/Skeleton";
import { useSnackbar } from "../components/Snackbar/hooks";
import { useStockContext } from "../components/StockContext/StockContextProvider";
import { useGetInventoryName } from "../db/hooks/useGetInventoryName";
import { useListExistingProducts } from "../db/hooks/useListProducts";
import { useListProductsCategorized } from "../db/hooks/useListProductsCategorized";
import { useUpdateRecords } from "../db/hooks/useUpdateRecords";
import { DeliveryTabScreenProps } from "../navigation/types";
import { documentScannerAction } from "../redux/documentScannerSlice";
import { useAppDispatch } from "../redux/hooks";
import { createStyles } from "../theme/useStyles";

export default function DeliveryTabScreen({
  route,
  navigation,
}: DeliveryTabScreenProps) {
  const styles = useStyles();

  const { isConnected } = useNetInfo();
  const inventoryId = route.params?.id;

  // const { showError, showInfo, showSuccess } = useSnackbar();
  const { showError, showSuccess } = useSnackbar();
  const dispatch = useAppDispatch();

  const { data: inventoryName } = useGetInventoryName(+inventoryId);

  const { productRecords } = useStockContext();

  // console.log({ productRecords });

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

  const {
    mutate,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
  } = useUpdateRecords(+inventoryId);

  useEffect(() => {
    navigation.setOptions({ headerTitle: inventoryName });
  }, [inventoryId, inventoryName, navigation]);

  useEffect(() => {
    dispatch(
      documentScannerAction.SET_INVENTORY_ID({ inventory_id: +inventoryId })
    );
  }, [inventoryId]);

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

  // const handlePress = () => {
  //   // WIP
  //   // deliveryForm.handleSubmit(
  //   //   (data) => {
  //   //     if (isEmpty(data)) {
  //   //       showInfo("Brak zmian do zapisania");
  //   //       return;
  //   //     }
  //   //     if (!isConnected) {
  //   //       showError("Brak połączenia z internetem");
  //   //       return;
  //   //     }
  //   //     mutate({ product_records: data.product_records, recipe_records: {} });
  //   //   },
  //   //   (_errors) => {
  //   //     // TODO show a snackbar? handle error better
  //   //     console.log("error", _errors);
  //   //   }
  //   // )();
  // };

  if (!productsIsSuccess || !categorizedIsSuccess || !inventoryId)
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
                    isScanningSalesRaport: false,
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
                // onPress={handlePress}
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
                    navigateTo: "DeliveryTab",
                  });
                }}
              >
                <ScanBarcodeIcon size={34} color="lightGrey" />
              </Button>
            </View>
            <IDListCardAddProduct inventoryId={inventoryId} />
            <IDListCardAddRecord inventoryId={inventoryId} />
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

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
    },
    scroll: {
      backgroundColor: theme.colors.darkBlue,
    },
    saveButtonContainer: {
      flexShrink: 1,
    },
    barcodeIconContainer: {
      flexGrow: 1,
    },
    doubleButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing,
      marginTop: theme.spacing * 2,
      gap: theme.spacing,
    },
    saveButtonLabel: {
      ...theme.text.l,
    },
    skeletonDate: {
      paddingTop: theme.spacing,
      paddingBottom: theme.spacing,
    },
    skeletonFullWidthButton: { width: "100%", height: 58 },
    skeletonButton: { width: 58, height: 58 },
    skeletonListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing * 6,
      paddingRight: theme.spacing * 4,
      marginBottom: theme.spacing * 2,
      height: 45,
    },
  })
);
