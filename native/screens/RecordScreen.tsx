import React, { useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { CollapsibleItem } from "../components/Collapsible/CollapsibleItem";
import { SingularCollapsible } from "../components/Collapsible/SingularCollapsible";
import { Divider } from "../components/Divider";
import SafeLayout from "../components/SafeLayout";
import { Skeleton } from "../components/Skeleton";
import TextInputController from "../components/TextInputController";
import { useGetInventoryName } from "../db/hooks/useGetInventoryName";
import { useGetPreviousRecordQuantity } from "../db/hooks/useGetPreviousRecordQuantity";
import {
  DeliveryStackParamList,
  InventoryStackParamList,
  RecordScreenNavigationProp,
} from "../navigation/types";
import { useRecordPagination } from "../utils/useRecordPagination";

export type RecordScreenProps = NativeStackScreenProps<
  InventoryStackParamList | DeliveryStackParamList,
  "RecordScreen"
>;

const RecordButton = ({
  label,
  style,
  onPress,
  type,
}: {
  label: string;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  type: "positive" | "negative";
}) => {
  return (
    <Button
      size="l"
      type="secondary"
      containerStyle={[
        {
          width: 72,
          height: 72,
        },
        style,
      ]}
      onPress={onPress}
    >
      <Typography variant="l" color={type === "positive" ? "green" : "red"}>
        {label}
      </Typography>
    </Button>
  );
};

const navigateToPreviousRecord = (
  navigate: RecordScreenNavigationProp["navigate"],
  isDelivery: RecordScreenProps["route"]["params"]["isDelivery"],
  id: number,
  prevRecordId: number | undefined,
  isFirst: boolean
) =>
  prevRecordId === undefined
    ? () => {}
    : () => {
        !isFirst &&
          navigate("RecordScreen", { id, recordId: prevRecordId, isDelivery });
      };

const navigateToNextRecord = (
  navigate: RecordScreenNavigationProp["navigate"],
  isDelivery: RecordScreenProps["route"]["params"]["isDelivery"],
  id: number,
  prevRecordId: number | undefined,
  isLast: boolean
) =>
  prevRecordId === undefined
    ? () => {}
    : () => {
        !isLast &&
          navigate("RecordScreen", { id, recordId: prevRecordId, isDelivery });
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
  const { id, recordId, isDelivery } = route.params;
  const queryClient = useQueryClient();

  const recordPanel = useRecordPanel(recordId);
  const isLoading = recordPanel?.isLoading;
  const isSuccess = recordPanel?.isSuccess;
  const record = recordPanel?.data;

  const { data: inventoryName } = useGetInventoryName(+id);
  const { data: recordIds } = useListRecordIds(id);
  const { data: previousQuantity } = useGetPreviousRecordQuantity(
    id,
    record?.product_id
  );

  const {
    control,
    //  handleSubmit, getValues, reset, watch
  } = useForm<{
    price_per_unit: string;
  }>({
    defaultValues: {
      price_per_unit: "0",
    },
    resetOptions: {
      keepDirtyValues: true,
    },
    mode: "onSubmit",
  });

  const { isFirst, isLast, nextRecordId, prevRecordId } = useRecordPagination(
    recordId,
    recordIds
  );

  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  useEffect(() => {
    navigation.setOptions({ headerTitle: inventoryName });
  }, [inventoryName, navigation]);

  if (
    !isSuccess ||
    isLoading ||
    !record?.steps ||
    !record?.inventory_id ||
    !record?.name
  )
    return (
      <View style={[styles.container, styles.bg]}>
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
    <SafeLayout
      style={[styles.container, styles.bg]}
      containerStyle={styles.bg}
      scrollable
    >
      <Typography
        variant={
          recordName.length > 12
            ? recordName.length > 28
              ? "sBold"
              : "lBold"
            : "xlBold"
        }
        style={styles.title}
        color="lightGrey"
      >
        {/* nazwa produktu */}
        {recordName}
      </Typography>
      <View style={styles.content}>
        <Typography variant="l" style={styles.wasTitle} color="lightGrey">
          Ile było:
        </Typography>
        <Typography
          variant={(previousQuantity || 0) > 999 ? "lBold" : "xlBold"}
          style={styles.wasAmount}
          color="lightGrey"
        >
          {unit && previousQuantity
            ? previousQuantity + " " + unit
            : "Brak danych"}
        </Typography>
        <View style={styles.gridRow}>
          <View style={styles.leftColumn}>
            {steppers.negative.map(({ click, step }, i) => (
              <RecordButton
                type="negative"
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
                isDelivery,
                record.inventory_id,
                prevRecordId,
                isFirst
              )}
            >
              <ArrowRightIcon size={32} color="highlight" />
            </Button>
          </View>
          <View style={styles.middleColumn}>
            <Typography color="lightGrey">Ile jest:</Typography>
            <Typography
              variant={(quantity || 0) > 999 ? "lBold" : "xlBold"}
              style={styles.title}
              color="lightGrey"
            >
              {/* liczba + jednostka current */}
              {unit ? quantity + " " + unit : "Brak"}
            </Typography>
            <Button
              type="primary"
              size="xl"
              containerStyle={styles.editButton}
              onPress={() => openManualInput(quantity!, setQuantity)}
            >
              <PencilIcon size={32} color="lightGrey" />
            </Button>
          </View>
          <View style={styles.rightColumn}>
            {steppers.positive.map(({ click, step }, i) => (
              <RecordButton
                type="positive"
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
                isDelivery,
                record.inventory_id,
                nextRecordId,
                isLast
              )}
            >
              <ArrowLeftIcon size={32} color="highlight" />
            </Button>
          </View>
        </View>
      </View>
      {isDelivery && (
        <>
          <Divider />
          <SingularCollapsible title="Aktualna cena">
            <CollapsibleItem isFirst isLast>
              <TextInputController
                control={control}
                name="price_per_unit"
                textInputProps={{
                  inputStyle: {
                    fontSize: 18,
                  },
                  containerStyle: { flex: 1 },
                  label: unit || "",
                }}
              />
            </CollapsibleItem>
          </SingularCollapsible>
        </>
      )}
    </SafeLayout>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    bg: {
      backgroundColor: theme.colors.darkBlue,
    },
    container: {
      paddingHorizontal: theme.spacing * 2,
      marginBottom: theme.spacing * 2,
    },
    title: { paddingTop: theme.spacing * 3 },
    wasTitle: { marginTop: theme.spacing * 2 },
    wasAmount: {
      paddingTop: theme.spacing * 2,
    },
    content: { alignItems: "center" },
    gridRow: { flexDirection: "row", paddingTop: theme.spacing },
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
