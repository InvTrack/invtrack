import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { usePathname, useRouter } from "expo-router";
import { useBottomSheet } from "../../../../components/BottomSheet";
import { InputBottomSheetContent } from "../../../../components/BottomSheet/contents";
import { Button } from "../../../../components/Button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PencilIcon,
} from "../../../../components/Icon";
import { Typography } from "../../../../components/Typography";
import { useRecordPanel } from "../../../../db";
import { useGetInventoryName } from "../../../../db/hooks/useGetInventoryName";
import { useListRecordIds } from "../../../../db/hooks/useListRecordIds";
import { createStyles } from "../../../../theme/useStyles";
import { useRecordPagination } from "../../../../utils/useRecordPagination";

const ProductButton = ({
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

// TODO fix fragile code
const getRecordId = (pathName: string) => pathName.split("/").splice(-1).pop();

const navigateToPreviousRecord =
  (
    replace: ReturnType<typeof useRouter>["replace"],
    inventoryId: number | undefined,
    prevRecordId: number | undefined,
    isFirst: boolean
  ) =>
  () => {
    !isFirst &&
      replace({
        pathname: "/(tabs)/inventory/[inventory]/[product]",
        params: { inventory: inventoryId, product: prevRecordId },
      });
  };

const navigateToNextRecord =
  (
    replace: ReturnType<typeof useRouter>["replace"],
    inventoryId: number | undefined,
    prevRecordId: number | undefined,
    isLast: boolean
  ) =>
  () => {
    !isLast &&
      replace({
        pathname: "/(tabs)/inventory/[inventory]/[product]",
        params: { inventory: inventoryId, product: prevRecordId },
      });
  };

export default function Product() {
  const styles = useStyles();
  const pathName = usePathname();
  const recordId = getRecordId(pathName);
  const recordPanel = useRecordPanel(recordId);
  const { data: recordIds } = useListRecordIds(recordPanel.data?.inventory_id);
  const { data: inventoryName } = useGetInventoryName(
    recordPanel.data?.inventory_id
  );

  const { isFirst, isLast, nextRecordId, prevRecordId } = useRecordPagination(
    +recordId!,
    recordIds
  );
  const router = useRouter();

  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  if (
    !recordPanel.isSuccess ||
    !recordPanel.data ||
    !recordPanel.data?.steps ||
    !recordPanel.data?.inventory_id
  )
    return <Typography>Loading product</Typography>;

  const { data, setQuantity, steppers } = recordPanel;

  const { name: productName, quantity, unit } = data;

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
          {productName}
        </Typography>
        <View style={styles.content}>
          <Typography variant="l" underline style={styles.wasTitle}>
            Ile było:
          </Typography>
          <Typography variant="xlBold" style={styles.wasAmount}>
            {/* liczba + jednostka previous*/}
            10 szt TODO
          </Typography>
          <View style={styles.gridRow}>
            <View style={styles.leftColumn}>
              {steppers.positive.map(({ click, step }, i) => (
                <ProductButton
                  key={"positive" + step + i}
                  label={`+${step}`}
                  onPress={click}
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
              {steppers.negative.map(({ click, step }, i) => (
                <ProductButton
                  key={"negative" + step + i}
                  label={step.toString()}
                  onPress={click}
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
    contentContainer: { paddingHorizontal: 24 },
    title: { marginTop: 24 },
    wasTitle: { marginTop: 44 },
    wasAmount: { marginTop: 16 },
    content: { alignItems: "center" },
    gridRow: { flexDirection: "row" },
    leftColumn: { flexDirection: "column", alignItems: "flex-start" },
    middleColumn: {
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "center",
      marginHorizontal: 16,
    },
    editButton: {
      marginTop: 24,
      borderRadius: 5,
      width: 72,
      height: 72,
      marginBottom: 58 + 12,
    },
    rightColumn: { flexDirection: "column", alignItems: "flex-end" },
    firstRecord: { opacity: 0.3 },
    lastRecord: { opacity: 0.3 },
  })
);
