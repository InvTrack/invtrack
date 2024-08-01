import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/common/Button";

import { useNetInfo } from "@react-native-community/netinfo";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isEmpty } from "lodash";
import { NewBarcodeListItem } from "../components/NewBarcodeListItem";
import { useSnackbar } from "../components/Snackbar/hooks";
import { EmptyScreenTemplate } from "../components/common/EmptyScreenTemplate";
import { useCreateProductRecords } from "../db/hooks/useCreateProductRecords";
import { useGetInventoryName } from "../db/hooks/useGetInventoryName";
import { useListMissingProducts } from "../db/hooks/useListMissingProducts";
import { StockStackParamList } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

type AddRecordScreenProps = NativeStackScreenProps<
  StockStackParamList,
  "AddRecordScreen"
>;

export function AddRecordScreen({ route, navigation }: AddRecordScreenProps) {
  const styles = useStyles();

  const { isConnected } = useNetInfo();
  const [highlighted, setHighlighted] = useState<
    NonNullable<ReturnType<typeof useListMissingProducts>["data"]>
  >([]);

  const { stockId } = route.params;

  const { data: inventoryName } = useGetInventoryName(+stockId);
  const { data: productList, isSuccess } = useListMissingProducts(+stockId);
  const {
    mutate,
    isSuccess: isInsertSuccess,
    isError: isInsertError,
  } = useCreateProductRecords(+stockId);
  const { showError, showSuccess } = useSnackbar();

  useEffect(() => {
    navigation.setOptions({ headerTitle: inventoryName });
  }, [stockId, inventoryName, navigation]);

  useEffect(() => {
    if (isInsertSuccess) {
      showSuccess("Zmiany zostały zapisane");
    }
    if (isInsertError) {
      showError("Nie udało się zapisać zmian");
    }
  }, [isInsertSuccess, isInsertError]);

  const handleSave = () => {
    if (isEmpty(highlighted) || !highlighted) return;

    mutate(
      highlighted.map((product) => ({
        product_id: product.id,
        ...product,
      }))
    );

    navigation.goBack();
  };

  if (isEmpty(productList)) {
    return (
      <EmptyScreenTemplate>
        Wszystkie obecnie dostępne produkty zostały dodane do tej
        inwentaryzacji.
      </EmptyScreenTemplate>
    );
  }

  if (!isSuccess)
    return (
      <SafeAreaView edges={["left", "right"]}>
        <View style={styles.scroll}>
          <View style={styles.listContainer}>
            <View style={styles.date}></View>
            <Skeleton style={styles.skeletonListItem} />
            <Skeleton style={styles.skeletonListItem} />
            <Skeleton style={styles.skeletonListItem} />
          </View>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView edges={["left", "right"]}>
      <ScrollView style={styles.scroll}>
        <View style={styles.listContainer}>
          <View style={styles.date}></View>
          {productList?.map((product) => (
            <NewBarcodeListItem
              key={product.id}
              highlighted={highlighted?.some(
                (highlightedProduct) => highlightedProduct.id === product.id
              )}
              name={product.name}
              onPress={
                highlighted?.some(
                  (highlightedProduct) => highlightedProduct.id === product.id
                )
                  ? () =>
                      setHighlighted(
                        highlighted.filter(
                          (highlightedProduct) =>
                            highlightedProduct.id !== product.id
                        )
                      )
                  : () => setHighlighted([...highlighted, product])
              }
            />
          ))}
        </View>
      </ScrollView>
      <View>
        <Button
          onPress={handleSave}
          size="l"
          type="primary"
          shadow
          disabled={!isConnected || !highlighted}
          containerStyle={[
            {
              bottom: 32,
              width: "80%",
              position: "absolute",
              alignSelf: "center",
            },
          ]}
        >
          Dodaj
        </Button>
      </View>
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
    },
    listContainer: { paddingHorizontal: theme.spacing * 2 },
    scroll: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.darkBlue,
    },
    date: {
      paddingTop: theme.spacing,
      paddingBottom: theme.spacing,
    },
    barcodeIconContainer: {
      alignSelf: "flex-end",
      marginBottom: 16,
    },
    skeletonTopBarText: { height: 20, width: "50%" },
    skeletonButton: { width: 58, height: 58 },
    skeletonListItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 16 * 3,
      paddingRight: 16 * 2,
      marginBottom: 16 * 2,
      height: 45,
    },
  })
);
