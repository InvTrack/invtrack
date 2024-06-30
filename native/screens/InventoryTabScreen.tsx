import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useFormContext } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { IDListCard } from "../components/IDListCard";
import { DocumentScannerIcon, ScanBarcodeIcon } from "../components/Icon";
import { Skeleton } from "../components/Skeleton";

import { useNetInfo } from "@react-native-community/netinfo";
import isEmpty from "lodash/isEmpty";
import { Collapsible } from "../components/Collapsible/Collapsible";
import { IDListCardAddProduct } from "../components/IDListCardAddProduct";
import { IDListCardAddRecord } from "../components/IDListCardAddRecord";
import { RecipeCard } from "../components/RecipeCard";
import { useSnackbar } from "../components/Snackbar/hooks";
import { StockForm } from "../components/StockFormContext/types";
import { useGetInventoryName } from "../db/hooks/useGetInventoryName";
import { useListCategorizedProductRecords } from "../db/hooks/useListCategorizedProductRecords";
import { useListRecipes } from "../db/hooks/useListRecipes";
import { useListUncategorizedProductRecords } from "../db/hooks/useListUncategorizedProductRecords";
import { useUpdateRecords } from "../db/hooks/useUpdateRecords";
import { InventoryTabScreenProps } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

export default function InventoryTabScreen({
  route,
  navigation,
}: InventoryTabScreenProps) {
  const styles = useStyles();

  const inventoryId = route.params?.id;
  const { isConnected } = useNetInfo();

  const { data: inventoryName } = useGetInventoryName(+inventoryId);
  const { data: uncategorizedRecordList, isSuccess: uncategorizedIsSuccess } =
    useListUncategorizedProductRecords(+inventoryId);
  const { data: categorizedRecordList, isSuccess: categorizedIsSuccess } =
    useListCategorizedProductRecords(+inventoryId);
  const { data: recipeList, isSuccess: recipesIsSuccess } =
    useListRecipes(inventoryId);

  const inventoryForm = useFormContext<StockForm>();
  const inventoryFormValues = inventoryForm.watch();

  const {
    mutate,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
  } = useUpdateRecords(+inventoryId);
  const { showError, showInfo, showSuccess } = useSnackbar();

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

  const handlePress = () => {
    inventoryForm.handleSubmit(
      (data) => {
        if (isEmpty(data)) {
          showInfo("Brak zmian do zapisania");
          return;
        }
        if (!isConnected) {
          showError("Brak połączenia z internetem");
          return;
        }
        mutate(data);
      },
      (_errors) => {
        // TODO show a snackbar? handle error better
        console.log("error", _errors);
      }
    )();
  };

  if (!uncategorizedIsSuccess || !categorizedIsSuccess || !recipesIsSuccess)
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
                    isScanningSalesRaport: true,
                  });
                }}
              >
                <DocumentScannerIcon size={34} color="lightGrey" />
              </Button>
              <Button
                containerStyle={styles.saveButtonContainer}
                size="xl"
                type="primary"
                fullWidth
                labelStyle={styles.saveButtonLabel}
                onPress={handlePress}
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
                    navigateTo: "InventoryTab",
                  });
                }}
              >
                <ScanBarcodeIcon size={34} color="lightGrey" />
              </Button>
            </View>
            <IDListCardAddProduct inventoryId={inventoryId} />
            <IDListCardAddRecord inventoryId={inventoryId} />
            {recipeList?.map((recipe) => (
              <RecipeCard
                key={recipe?.id}
                inventoryId={inventoryId}
                name={recipe.name}
                recipePart={recipe.recipe_part}
                recipeRecordId={recipe.recipe_record?.[0]?.id}
              />
            ))}
            {uncategorizedRecordList?.map((record) =>
              record ? (
                <IDListCard
                  key={record.id}
                  recordId={record.id!}
                  productId={record.product_id!}
                  inventoryId={inventoryId}
                  id={+inventoryId}
                  quantity={
                    record.id
                      ? inventoryFormValues.product_records[record.id]
                          ?.quantity ?? record.quantity
                      : null
                  }
                  unit={record.unit!}
                  name={record.name!}
                />
              ) : (
                <></>
              )
            )}
          </ScrollView>
        }
        sections={categorizedRecordList?.map(({ title, data }, i) => ({
          id: i + 1,
          title: title,
          data: data.map((record) =>
            record ? (
              <IDListCard
                key={record.id}
                recordId={record.id!}
                productId={record.product_id!}
                inventoryId={inventoryId}
                id={+inventoryId}
                quantity={
                  record.id
                    ? inventoryFormValues.product_records[record.id]
                        ?.quantity ?? record.quantity
                    : null
                }
                unit={record.unit!}
                name={record.name!}
                borderBottom={data![data.length - 1]?.id === record.id}
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
    saveButtonLabel: {
      ...theme.text.l,
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
