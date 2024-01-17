import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Link, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../components/Button";
import { ScanBarcodeIcon } from "../../../components/Icon";
import { InventoryListCard } from "../../../components/InventoryListCard";
import { Skeleton } from "../../../components/Skeleton";
import { Typography } from "../../../components/Typography";
import { useListRecords } from "../../../db";
import { useGetInventoryName } from "../../../db/hooks/useGetInventoryName";
import { createStyles } from "../../../theme/useStyles";

export default function InventoryIdIndex() {
  const styles = useStyles();

  const { id: inventoryId } = useLocalSearchParams();
  const { data: recordList, isSuccess } = useListRecords(+inventoryId);
  const { data: inventoryName } = useGetInventoryName(+inventoryId);

  if (!isSuccess || (recordList && recordList.length === 0))
    return (
      <SafeAreaView edges={["left", "right"]}>
        <View style={styles.scroll}>
          <View style={styles.topBar}>
            <Skeleton style={styles.skeletonTopBarText} />
          </View>
          <View style={styles.listContainer}>
            <View style={styles.date}></View>
            <View style={styles.barcodeIconContainer}>
              <Skeleton borderRadius={999} style={styles.skeletonButton} />
            </View>
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
        <View style={styles.topBar}>
          <Typography variant="xsBold">{inventoryName ?? ""}</Typography>
        </View>
        <View style={styles.listContainer}>
          <View style={styles.date}></View>
          <Link
            href={{
              pathname: "/barcode_modal",
              params: { inventoryId, route: "inventory" },
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
          {recordList.map(({ name, quantity, unit, id }) => (
            <InventoryListCard
              key={id}
              recordId={id!}
              inventoryId={+inventoryId}
              quantity={quantity!}
              unit={unit!}
              name={name!}
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
