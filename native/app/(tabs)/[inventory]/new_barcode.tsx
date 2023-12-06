import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../components/Button";
import { NewBarcodeListItem } from "../../../components/NewBarcodeListItem";
import { Skeleton } from "../../../components/Skeleton";
import { Typography } from "../../../components/Typography";
import { supabase, useListRecords } from "../../../db";

import { useListBarcodes } from "../../../db/hooks/useListBarcodes";
import { useInsertBarcode } from "../../../db/hooks/useUpdateBarcode";
import { createStyles } from "../../../theme/useStyles";

type NewBarcodeLocalSearchParams = {
  inventory: string;
  barcode: string;
};

export default function NewBarcode() {
  const styles = useStyles();
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const { inventory: inventoryId, barcode } =
    useLocalSearchParams<NewBarcodeLocalSearchParams>();
  const tabBarHeight = useBottomTabBarHeight();

  const { data: recordList, isSuccess } = useListRecords(+inventoryId);
  const { data: barcodeList, isLoading } = useListBarcodes(+inventoryId);
  const { mutate } = useInsertBarcode(+inventoryId);

  const handleSaveNewBarcode = async () => {
    // if (
    //   !highlighted
    //   || !barcode
    // )
    //   return;
    mutate({
      new_barcode: "d",
      product_id: 2,
    });
  };

  if (!isSuccess || isLoading || (recordList && recordList.length === 0))
    return (
      <SafeAreaView edges={["left", "right"]}>
        <View style={styles.scroll}>
          <View style={styles.topBar}>
            <Skeleton style={styles.skeletonTopBarText} />
          </View>
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
        <View style={styles.topBar}>
          <Typography variant="xsBold">Dodaj kod kreskowy </Typography>
        </View>
        <View style={styles.listContainer}>
          <View style={styles.date}></View>
          {/* {Object.values(barcodeList ?? {}).map(({ recordName, productId }) => (
            <Pressable
              key={recordName}
              onPress={() =>
                highlighted == productId
                  ? setHighlighted(null)
                  : setHighlighted(productId)
              }
            >
              <NewBarcodeListItem
                highlighted={highlighted == productId}
                inventoryId={+inventoryId}
                name={recordName!}
              />
            </Pressable>
          ))} */}
        </View>
      </ScrollView>
      <View>
        <Button
          onPress={handleSaveNewBarcode}
          size="l"
          type="primary"
          shadow
          // disabled={!highlighted || !barcode}
          containerStyle={[
            { bottom: tabBarHeight },
            {
              width: "80%",
              position: "fixed",
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
