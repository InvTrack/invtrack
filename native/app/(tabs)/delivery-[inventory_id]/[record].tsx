import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useBottomSheet } from "../../../components/BottomSheet";
import { InputBottomSheetContent } from "../../../components/BottomSheet/contents";
import { Button } from "../../../components/Button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PencilIcon,
} from "../../../components/Icon";
import { Typography } from "../../../components/Typography";
import { useRecordPanel } from "../../../db";
import { useGetInventoryName } from "../../../db/hooks/useGetInventoryName";
import { useListRecordIds } from "../../../db/hooks/useListRecordIds";
import { createStyles } from "../../../theme/useStyles";

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../../../components/Skeleton";
import { useGetPreviousRecordQuantity } from "../../../db/hooks/useGetPreviousRecordQuantity";
import { useRecordPagination } from "../../../utils/useRecordPagination";

const RecordButton = ({
  label,
  style,
  onPress,
}: {
  label: string;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
}) => {
  return (
    <Button
      size="l"
      type="primary"
      containerStyle={[
        {
          borderRadius: 5,
          width: 72,
          height: 72,
        },
        style,
      ]}
      onPress={onPress}
    >
      <Typography variant="l">{label}</Typography>
    </Button>
  );
};

const navigateToPreviousRecord = (
  replace: ReturnType<typeof useRouter>["replace"],
  inventoryId: number,
  prevRecordId: number | undefined,
  isFirst: boolean
) =>
  prevRecordId === undefined
    ? () => {}
    : () => {
        !isFirst &&
          replace({
            pathname: "/(tabs)/delivery-[inventory_id]/[record]",
            params: { inventory: inventoryId, record: prevRecordId },
          });
      };

const navigateToNextRecord = (
  replace: ReturnType<typeof useRouter>["replace"],
  inventoryId: number,
  prevRecordId: number | undefined,
  isLast: boolean
) =>
  prevRecordId === undefined
    ? () => {}
    : () => {
        !isLast &&
          replace({
            pathname: "/(tabs)/delivery-[inventory_id]/[record]",
            params: { inventory: inventoryId, record: prevRecordId },
          });
      };

const onRecordButtonStepperPress =
  (
    click: () => void,
    inventoryId: number,
    productId: number | null,
    queryClient: QueryClient
  ) =>
  () => {
    click();
    queryClient.invalidateQueries(["recordsList", inventoryId]);
    queryClient.invalidateQueries([
      "previousRecordQuantity",
      inventoryId,
      productId,
    ]);
  };

export default function Record() {
  const styles = useStyles();
  const localSearchParams = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const recordId = +localSearchParams.record;
  const inventoryId = +localSearchParams.inventory;
  const recordPanel = useRecordPanel(recordId);
  const { data: recordIds } = useListRecordIds(inventoryId);
  const { data: inventoryName } = useGetInventoryName(inventoryId);
  const { data: previousQuantity } = useGetPreviousRecordQuantity(
    inventoryId,
    recordPanel.data?.product_id
  );

  const { isFirst, isLast, nextRecordId, prevRecordId } = useRecordPagination(
    recordId,
    recordIds
  );

  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  if (
    !recordPanel.isSuccess ||
    !recordPanel.data?.steps ||
    !recordPanel.data?.inventory_id ||
    !recordPanel.data?.name
  )
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Skeleton style={styles.skeletonTopbar} />
        </View>
        <View style={styles.contentContainer}>
          <Skeleton style={styles.skeletonTitle} />
          <View style={styles.skeletonQuantity}>
            <Skeleton />
          </View>
          <View style={styles.skeletonColumns}>
            <View style={styles.skeletonColumnContainer}>
              <Skeleton style={styles.skeletonColumn} />
            </View>
            <View style={styles.skeletonColumnContainer}>
              <Skeleton style={styles.skeletonColumn} />
            </View>
            <View style={styles.skeletonColumnContainer}>
              <Skeleton style={styles.skeletonColumn} />
            </View>
          </View>
        </View>
      </View>
    );

  const { data, setQuantity, steppers } = recordPanel;
  const { name: recordName, quantity, unit } = data;

  const openManualInput = (
    quantity: number,
    setQuantity: (quantity: number) => void
  ) =>
    openBottomSheet(() => (
      <InputBottomSheetContent
        quantity={quantity}
        setQuantity={setQuantity}
        closeBottomSheet={closeBottomSheet}
      />
    ));

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Typography variant="xsBold">{inventoryName ?? ""}</Typography>
      </View>
      <View style={styles.contentContainer}>
        <Typography variant="xlBold" underline style={styles.title}>
          {/* nazwa produktu */}
          {recordName}
        </Typography>
        <View style={styles.content}>
          <Typography variant="l" underline style={styles.wasTitle}>
            Ile było:
          </Typography>
          <Typography
            variant={(previousQuantity || 0) > 999 ? "lBold" : "xlBold"}
            style={styles.wasAmount}
          >
            {unit ? previousQuantity + " " + unit : null}
          </Typography>
          <View style={styles.gridRow}>
            <View style={styles.leftColumn}>
              {steppers.negative.map(({ click, step }, i) => (
                <RecordButton
                  key={"negative" + step + i}
                  label={step.toString()}
                  onPress={onRecordButtonStepperPress(
                    click,
                    inventoryId,
                    recordPanel.data?.product_id,
                    queryClient
                  )}
                />
              ))}
              <Button
                type="primary"
                size="l"
                disabled={isFirst}
                containerStyle={isFirst && styles.firstRecord}
                onPress={navigateToPreviousRecord(
                  router.replace,
                  recordPanel.data.inventory_id,
                  prevRecordId,
                  isFirst
                )}
              >
                <ArrowRightIcon size={32} />
              </Button>
            </View>
            <View style={styles.middleColumn}>
              <Typography underline>Ile jest:</Typography>
              <Typography
                variant={(quantity || 0) > 999 ? "lBold" : "xlBold"}
                style={styles.title}
              >
                {/* liczba + jednostka current */}
                {unit ? quantity + " " + unit : null}
              </Typography>
              <Button
                type="primary"
                size="xl"
                containerStyle={styles.editButton}
                onPress={() => openManualInput(quantity!, setQuantity)}
              >
                <PencilIcon size={32} />
              </Button>
            </View>
            <View style={styles.rightColumn}>
              {steppers.positive.map(({ click, step }, i) => (
                <RecordButton
                  key={"positive" + step + i}
                  label={`+${step}`}
                  onPress={onRecordButtonStepperPress(
                    click,
                    inventoryId,
                    recordPanel.data?.product_id,
                    queryClient
                  )}
                />
              ))}
              <Button
                type="primary"
                size="l"
                disabled={isLast}
                containerStyle={isLast && styles.lastRecord}
                onPress={navigateToNextRecord(
                  router.replace,
                  recordPanel.data.inventory_id,
                  nextRecordId,
                  isLast
                )}
              >
                <ArrowLeftIcon size={32} />
              </Button>
            </View>
          </View>
        </View>
      </View>
    </View>
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
    container: { backgroundColor: theme.colors.lightBlue, height: "100%" },
    contentContainer: { paddingHorizontal: theme.spacing * 3 },
    title: { paddingTop: theme.spacing * 3 },
    wasTitle: { marginTop: theme.spacing * 5.5 },
    wasAmount: { paddingTop: theme.spacing * 2 },
    content: { alignItems: "center" },
    gridRow: { flexDirection: "row" },
    leftColumn: { flexDirection: "column", alignItems: "flex-start" },
    middleColumn: {
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "center",
      marginHorizontal: theme.spacing * 2,
    },
    editButton: {
      marginTop: theme.spacing * 3,
      borderRadius: theme.borderRadiusSmall,
      width: 72,
      height: 72,
      marginBottom: 58 + 12,
    },
    rightColumn: { flexDirection: "column", alignItems: "flex-end" },
    firstRecord: { opacity: theme.opacity / 2 },
    lastRecord: { opacity: theme.opacity / 2 },
    skeletonColumn: {
      height: "60%",
    },
    skeletonColumnContainer: {
      width: "25%",
    },
    skeletonColumns: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      gap: 16,
    },
    skeletonQuantity: {
      aspectRatio: 1,
      width: "40%",
      alignSelf: "center",
      marginTop: 32,
    },
    skeletonTitle: { marginTop: 32, width: "70%", height: 50 },
    skeletonTopbar: {
      width: "70%",
      height: 20,
    },
  })
);
