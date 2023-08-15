import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { InventoryListCard } from "../../../components/InventoryListCard";
import { Typography } from "../../../components/Typography";
import { useListRecords } from "../../../db";
import { useGetInventoryName } from "../../../db/hooks/useGetInventoryName";
import { createStyles } from "../../../theme/useStyles";

export default function InventoryIdIndex() {
  const styles = useStyles();

  const { inventory: inventoryId } = useLocalSearchParams();
  const { data: recordList, isSuccess } = useListRecords(+inventoryId);
  const { data: inventoryName } = useGetInventoryName(+inventoryId);

  if (!isSuccess || (recordList && recordList.length === 0))
    return <Typography>Loading records</Typography>;

  return (
    <SafeAreaView edges={["left", "right"]}>
      <ScrollView style={styles.scroll}>
        <View style={styles.topBar}>
          <Typography variant="xsBold">{inventoryName ?? ""}</Typography>
        </View>
        <View style={styles.listContainer}>
          <View style={styles.date}></View>
          {recordList.map(({ name, quantity, unit, id }) => (
            // TODO - think of a clever way to check if these are not null, and let TS know
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
    topBar: {
      ...theme.baseShadow,
      width: "100%",
      backgroundColor: theme.colors.mediumBlue,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    listContainer: {
      paddingHorizontal: theme.spacing * 4,
    },
    scroll: {
      width: "100%",
      height: "100%",
    },
    date: {
      paddingTop: theme.spacing,
      paddingBottom: theme.spacing,
    },
  })
);
