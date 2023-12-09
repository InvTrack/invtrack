import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../components/Button";
import { NewBarcodeListItem } from "../../../components/NewBarcodeListItem";
import { Skeleton } from "../../../components/Skeleton";
import { Typography } from "../../../components/Typography";
import { useListRecords } from "../../../db";

import { useInsertBarcode } from "../../../db/hooks/useUpdateBarcode";
import { createStyles } from "../../../theme/useStyles";

type NewBarcodeLocalSearchParams = {
  inventory: string;
  new_barcode: string;
};

export default function NewBarcode() {
  const styles = useStyles();
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const router = useRouter();
  const { inventory: inventoryId, new_barcode } =
    useLocalSearchParams<NewBarcodeLocalSearchParams>();
  const tabBarHeight = useBottomTabBarHeight();

  const { data: recordList, isSuccess } = useListRecords(+inventoryId);
  const { mutate } = useInsertBarcode(+inventoryId);

  const handleSaveNewBarcode = () => {
    if (!highlighted || !new_barcode) return;

    mutate({ new_barcode, product_id: highlighted });
    router.back();
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
          {Object.values(recordList ?? {}).map(({ name, product_id }) => (
            <Pressable
              key={name}
              onPress={() =>
                highlighted == product_id
                  ? setHighlighted(null)
                  : setHighlighted(product_id)
              }
            >
              <NewBarcodeListItem
                highlighted={highlighted == product_id}
                inventoryId={+inventoryId}
                name={name!}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View>
        <Button
          onPress={handleSaveNewBarcode}
          size="l"
          type="primary"
          shadow
          disabled={!highlighted || !new_barcode}
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
