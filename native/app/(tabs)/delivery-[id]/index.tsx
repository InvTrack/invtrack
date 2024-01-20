import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Link, useLocalSearchParams } from "expo-router";
import { useFormContext } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../components/Button";
import { DeliveryForm } from "../../../components/DeliveryFormContext/deliveryForm.types";
import { IDListCard } from "../../../components/IDListCard";
import { ScanBarcodeIcon } from "../../../components/Icon";
import { Skeleton } from "../../../components/Skeleton";
import { Typography } from "../../../components/Typography";
import { useListRecords } from "../../../db";
import { useGetInventoryName } from "../../../db/hooks/useGetInventoryName";
import { useUpdateRecords } from "../../../db/hooks/useUpdateRecord";
import { createStyles } from "../../../theme/useStyles";

export default function InventoryIdIndex() {
  const styles = useStyles();

  const { id: inventoryId } = useLocalSearchParams();
  const { data: recordList, isSuccess } = useListRecords(+inventoryId);
  const { data: inventoryName } = useGetInventoryName(+inventoryId);
  const deliveryForm = useFormContext<DeliveryForm>();
  const { mutate } = useUpdateRecords(+inventoryId);

  const handlePress = () => {
    deliveryForm.handleSubmit(
      (data) => {
        mutate(data);
      },
      (_errors) => {
        // TODO show a snackbar? handle error better
        // console.log("error", errors);
      }
    )();
  };

  if (!isSuccess || (recordList && recordList.length === 0))
    return (
      <SafeAreaView edges={["left", "right"]}>
        <View style={styles.scroll}>
          <View style={styles.topBar}>
            <Skeleton style={styles.skeletonTopBarText} />
          </View>
          <View style={styles.listContainer}>
            <View style={styles.date}></View>
            <View style={styles.topButtonsContainer}>
              <Skeleton
                style={[
                  styles.saveButtonContainer,
                  styles.skeletonFullWidthButton,
                ]}
              />
              <View style={styles.barcodeIconContainer}>
                <Skeleton borderRadius={999} style={styles.skeletonButton} />
              </View>
            </View>
            <Skeleton borderRadius={5} style={styles.skeletonListItem} />
            <Skeleton borderRadius={5} style={styles.skeletonListItem} />
            <Skeleton borderRadius={5} style={styles.skeletonListItem} />
            <Skeleton borderRadius={5} style={styles.skeletonListItem} />
            <Skeleton borderRadius={5} style={styles.skeletonListItem} />
            <Skeleton borderRadius={5} style={styles.skeletonListItem} />
          </View>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView edges={["left", "right"]}>
      <ScrollView style={styles.scroll}>
        <View style={styles.topBar}>
          <Typography variant="xsBold">{inventoryName ?? ""}</Typography>
        </View>
        <View style={styles.listContainer}>
          <View style={styles.date}></View>
          <View style={styles.topButtonsContainer}>
            <Button
              containerStyle={styles.saveButtonContainer}
              size="l"
              type="primary"
              fullWidth
              onPress={handlePress}
            >
              Zapisz zmiany
            </Button>
            <Link
              href={{
                pathname: "/barcode_modal",
                params: { inventoryId, route: "delivery" },
              }}
              asChild
            >
              <Button
                containerStyle={styles.barcodeIconContainer}
                size="l"
                type="primary"
              >
                <ScanBarcodeIcon size={34} />
              </Button>
            </Link>
          </View>
          {recordList.map(({ name, quantity, unit, id }) => (
            <IDListCard
              key={id}
              recordId={id!}
              inventoryId={+inventoryId}
              quantity={quantity!}
              unit={unit!}
              name={name!}
              isDelivery
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightBlue,
    },
    topBar: {
      ...theme.baseShadow,
      width: "100%",
      backgroundColor: theme.colors.mediumBlue,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    listContainer: { paddingHorizontal: theme.spacing * 4 },
    scroll: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.lightBlue,
    },
    date: {
      paddingTop: theme.spacing,
      paddingBottom: theme.spacing,
    },
    saveButtonContainer: {
      flexShrink: 1,
    },
    barcodeIconContainer: {
      flexGrow: 1,
    },
    topButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: theme.spacing * 4,
      marginTop: theme.spacing * 2,
      gap: theme.spacing,
    },
    skeletonTopBarText: { height: 20, width: "50%" },
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
