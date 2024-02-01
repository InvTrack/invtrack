import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useBottomSheet } from "../components/BottomSheet";
import { InputBottomSheetContent } from "../components/BottomSheet/contents";
import { Button } from "../components/Button";
import { ArrowLeftIcon, ArrowRightIcon, PencilIcon } from "../components/Icon";
import { Typography } from "../components/Typography";
import { useRecordPanel } from "../db";
import { useListRecordIds } from "../db/hooks/useListRecordIds";
import { createStyles } from "../theme/useStyles";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../components/Skeleton";
import { useGetPreviousRecordQuantity } from "../db/hooks/useGetPreviousRecordQuantity";
import {
  DeliveryStackParamList,
  InventoryStackParamList,
  RecordScreenNavigationProp,
} from "../navigation/types";
import { useRecordPagination } from "../utils/useRecordPagination";
import { useRunBlurEffect } from "../utils/useRunBlurEffect";

export type RecordScreenProps = NativeStackScreenProps<
  InventoryStackParamList | DeliveryStackParamList,
  "RecordScreen"
>;

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
  navigate: RecordScreenNavigationProp["navigate"],
  id: number,
  prevRecordId: number | undefined,
  isFirst: boolean
) =>
  prevRecordId === undefined
    ? () => {}
    : () => {
        !isFirst && navigate("RecordScreen", { id, recordId: prevRecordId });
      };

const navigateToNextRecord = (
  navigate: RecordScreenNavigationProp["navigate"],
  id: number,
  prevRecordId: number | undefined,
  isLast: boolean
) =>
  prevRecordId === undefined
    ? () => {}
    : () => {
        !isLast && navigate("RecordScreen", { id, recordId: prevRecordId });
      };

const onRecordButtonStepperPress =
  (
    click: () => void,
    id: number,
    productId: number | null,
    queryClient: QueryClient
  ) =>
  () => {
    click();
    queryClient.invalidateQueries(["previousRecordQuantity", id, productId]);
  };

export function RecordScreen({ route, navigation }: RecordScreenProps) {
  const styles = useStyles();
  const { id, recordId } = route.params;
  const queryClient = useQueryClient();

  const {
    data: record,
    isSuccess,
    isLoading,
    ...recordPanel
  } = useRecordPanel(recordId);
  const { data: recordIds } = useListRecordIds(id);
  const { data: previousQuantity } = useGetPreviousRecordQuantity(
    id,
    record?.product_id
  );

  const { isFirst, isLast, nextRecordId, prevRecordId } = useRecordPagination(
    recordId,
    recordIds
  );

  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  useRunBlurEffect(() => {
    queryClient.invalidateQueries(["recordsList", id], {
      type: "all",
    });
  });

  if (
    !isSuccess ||
    isLoading ||
    !record?.steps ||
    !record?.inventory_id ||
    !record?.name
  )
    return (
      <View style={styles.container}>
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

  const { steppers, setQuantity, quantity } = recordPanel;

  const { name: recordName, unit } = record;

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
                    id,
                    record?.product_id,
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
                  navigation.navigate,
                  record.inventory_id,
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
                    id,
                    record?.product_id,
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
                  navigation.navigate,
                  record.inventory_id,
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
