import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useNetInfo } from "@react-native-community/netinfo";
import isEmpty from "lodash/isEmpty";
import { useFormContext } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { Collapsible } from "../components/Collapsible/Collapsible";
import { IDListCard } from "../components/IDListCard";
import { IDListCardAddProduct } from "../components/IDListCardAddProduct";
import { IDListCardAddRecord } from "../components/IDListCardAddRecord";
import { DocumentScannerIcon, ScanBarcodeIcon } from "../components/Icon";
import { Skeleton } from "../components/Skeleton";
import { useSnackbar } from "../components/Snackbar/hooks";
import { StockForm } from "../components/StockFormContext/types";
import { useGetInventoryName } from "../db/hooks/useGetInventoryName";
import { useListCategorizedProductRecords } from "../db/hooks/useListCategorizedProductRecords";
import { useListUncategorizedProductRecords } from "../db/hooks/useListUncategorizedProductRecords";
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

  const { showError, showInfo, showSuccess } = useSnackbar();
  const dispatch = useAppDispatch();

  const { data: inventoryName } = useGetInventoryName(+inventoryId);
  const { data: uncategorizedRecordList, isSuccess: uncategorizedIsSuccess } =
    useListUncategorizedProductRecords(+inventoryId);
  const { data: categorizedRecordList, isSuccess: categorizedIsSuccess } =
    useListCategorizedProductRecords(+inventoryId);

  const deliveryForm = useFormContext<StockForm>();
  const deliveryFormValues = deliveryForm.watch();

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

  const handlePress = () => {
    deliveryForm.handleSubmit(
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

  if (!uncategorizedIsSuccess || !categorizedIsSuccess)
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
                    navigateTo: "DeliveryTab",
                  });
                }}
              >
                <ScanBarcodeIcon size={34} color="lightGrey" />
              </Button>
            </View>
            <IDListCardAddProduct inventoryId={inventoryId} />
            <IDListCardAddRecord inventoryId={inventoryId} />
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
                      ? deliveryFormValues.product_records[record.id]
                          ?.quantity ?? record.quantity
                      : null
                  }
                  unit={record.unit!}
                  name={record.name}
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
                    ? deliveryFormValues.product_records[record.id]?.quantity ??
                      record.quantity
                    : null
                }
                unit={record.unit!}
                name={record.name}
                borderBottom={data[data.length - 1]?.id === record.id}
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
