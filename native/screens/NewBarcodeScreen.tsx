import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { NewBarcodeListItem } from "../components/NewBarcodeListItem";
import { Skeleton } from "../components/Skeleton";
import { useListProductRecords } from "../db";

import { useNetInfo } from "@react-native-community/netinfo";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSnackbar } from "../components/Snackbar/context";
import { useInsertBarcode } from "../db/hooks/useUpdateBarcode";
import { HomeStackParamList } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

type NewBarcodeScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "NewBarcodeScreen"
>;

export function NewBarcodeScreen({ route, navigation }: NewBarcodeScreenProps) {
  const styles = useStyles();

  const { isConnected } = useNetInfo();
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const { inventoryId, new_barcode } = route.params;

  const { data: recordList, isSuccess } = useListProductRecords(+inventoryId);
  const {
    mutate,
    isError: isInsertError,
    isSuccess: isInsertSuccess,
  } = useInsertBarcode(+inventoryId);
  const { showError, showSuccess } = useSnackbar();

  const handleSaveNewBarcode = () => {
    if (!highlighted || !new_barcode) return;

    mutate({ new_barcode, product_id: highlighted });
    navigation.goBack();
  };

  useEffect(() => {
    if (isInsertSuccess) {
      showSuccess("Zmiany zostały zapisane");
    }
    if (isInsertError) {
      showError("Nie udało się zapisać zmian");
    }
  }, [isInsertSuccess, isInsertError]);

  if (!isSuccess || (recordList && recordList.length === 0))
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
          {Object.values(recordList ?? {}).map(({ name, product_id }) => (
            <Pressable
              key={product_id}
              onPress={() =>
                highlighted == product_id
                  ? setHighlighted(null)
                  : setHighlighted(product_id)
              }
            >
              <NewBarcodeListItem
                highlighted={highlighted == product_id}
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
          disabled={!isConnected || !highlighted || !new_barcode}
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
    listContainer: { paddingHorizontal: theme.spacing * 4 },
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
