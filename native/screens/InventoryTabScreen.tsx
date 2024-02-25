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
import isEmpty from "lodash/isEmpty";
import { IDListCardAdd } from "../components/IDListCardAdd";
import { useSnackbar } from "../components/Snackbar/context";
import { useListRecords } from "../db";
import { useGetInventoryName } from "../db/hooks/useGetInventoryName";
import { useUpdateRecords } from "../db/hooks/useUpdateRecord";
import { InventoryTabScreenProps } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

export default function InventoryTabScreen({
  route,
  navigation,
}: InventoryTabScreenProps) {
  const styles = useStyles();

  const inventoryId = route.params?.id;
  const { isConnected } = useNetInfo();

  const { data: recordList, isSuccess } = useListRecords(+inventoryId);
  const { data: inventoryName } = useGetInventoryName(+inventoryId);
  const inventoryForm = useFormContext<InventoryForm>();
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

  if (!isSuccess)
    return (
      <SafeAreaView edges={["left", "right"]}>
        <View style={styles.scroll}>
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
              <ScanBarcodeIcon size={34} color="lightGrey" />
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
          <IDListCardAdd inventoryId={inventoryId} />
        </View>
      </ScrollView>
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
