import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useFormContext } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { IDListCard } from "../components/IDListCard";
import { ScanBarcodeIcon } from "../components/Icon";
import { InventoryForm } from "../components/InventoryFormContext/inventoryForm.types";
import { Skeleton } from "../components/Skeleton";

import { useNetInfo } from "@react-native-community/netinfo";
import { useSnackbar } from "../components/Snackbar";
import { useListRecords } from "../db";
import { useUpdateRecords } from "../db/hooks/useUpdateRecord";
import { InventoryTabScreenProps } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

export default function InventoryTabScreen({
  route,
  navigation,
}: InventoryTabScreenProps) {
  const styles = useStyles();

  const { id: inventoryId } = route.params;
  const { isConnected } = useNetInfo();

  const { data: recordList, isSuccess } = useListRecords(+inventoryId);
  const inventoryForm = useFormContext<InventoryForm>();
  const {
    mutate,
    isSuccess: isUpdateSuccess,
    isError: isUpdateError,
  } = useUpdateRecords(+inventoryId);
  const { notify } = useSnackbar();

  useEffect(() => {
    if (isUpdateSuccess) {
      notify("success", {
        params: {
          title: "Zapisano",
          description: "Zmiany zostały zapisane",
        },
      });
    }
    if (isUpdateError) {
      notify("error", {
        params: {
          title: "Błąd",
          description: "Nie udało się zapisać zmian",
        },
      });
    }
  }, [isUpdateSuccess, isUpdateError]);

  const handlePress = () => {
    inventoryForm.handleSubmit(
      (data) => {
        mutate(data);
      },
      (_errors) => {
        // TODO show a snackbar? handle error better
        console.log("error", _errors);
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
        <View style={styles.listContainer}>
          <View style={styles.date}></View>
          <View style={styles.topButtonsContainer}>
            <Button
              containerStyle={styles.saveButtonContainer}
              size="l"
              type="primary"
              fullWidth
              onPress={handlePress}
              disabled={!isConnected}
            >
              Zapisz zmiany
            </Button>
            <Button
              containerStyle={styles.barcodeIconContainer}
              size="l"
              type="primary"
              onPress={() => {
                // necessary hack, handled by parent navigator - be cautious
                navigation.navigate("BarcodeModal" as any, {
                  inventoryId,
                  navigateTo: "InventoryTab",
                });
              }}
            >
              <ScanBarcodeIcon size={34} />
            </Button>
          </View>
          {recordList.map(({ name, quantity, unit, id }) => (
            <IDListCard
              key={id}
              recordId={id!}
              id={+inventoryId}
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
