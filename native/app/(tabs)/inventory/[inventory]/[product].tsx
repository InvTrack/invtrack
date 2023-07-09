import React from "react";
import { Keyboard, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useForm } from "react-hook-form";
import { Button } from "../../../../components/Button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PencilIcon,
} from "../../../../components/Icon";
import { ProductInputController } from "../../../../components/ProductInputController";
import { Typography } from "../../../../components/Typography";
import { useRecordPanel } from "../../../../db";
import { useGetInventoryName } from "../../../../db/hooks/useGetInventoryName";
import { createStyles } from "../../../../theme/useStyles";
const { usePathname } = require("expo-router");

type ProductInputValues = {
  quantityManual: number;
};

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

export default function Product() {
  const styles = useStyles();
  const pathName = usePathname();
  const recordId = getRecordId(pathName);
  const recordPanel = useRecordPanel(recordId);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const {
    control,
    handleSubmit,
    setFocus,
    // setValue,
    // resetField,
    // watch,
    // reset,
    // register,
  } = useForm<ProductInputValues>({
    defaultValues: {
      quantityManual: recordPanel.data?.quantity ?? 0,
    },
    reValidateMode: "onSubmit",
  });
  const { data: inventoryName } = useGetInventoryName(
    recordPanel.data?.inventory_id
  );

  // React.useEffect(() => {
  //   register("quantityManual");
  // }, [register]);

  // React.useLayoutEffect(() => {
  //   if (!recordPanel.data?.quantity) return;
  //   setValue("quantityManual", recordPanel.data?.quantity);
  //   reset({ quantityManual: recordPanel.data?.quantity });
  // }, [recordPanel.data?.quantity, setValue, resetField]);

  if (
    !recordPanel.isSuccess ||
    !recordPanel.data ||
    !recordPanel.data?.steps ||
    !recordPanel.data?.inventory_id
  )
    return <Typography>Loading product</Typography>;

  const { data, setQuantity, steppers } = recordPanel;

  const { name: productName, quantity, unit } = data;

  const onSubmit = ({ quantityManual }: ProductInputValues) => {
    setQuantity(quantityManual);
    setIsEditMode(false);
  };
  return (
    <View style={styles.container} onTouchStart={() => Keyboard.dismiss()}>
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
              <Button type="primary" size="l">
                <ArrowRightIcon size={32} />
              </Button>
            </View>
            <View style={styles.middleColumn}>
              <Typography underline>Ile jest:</Typography>
              {isEditMode ? (
                <ProductInputController
                  name="quantityManual"
                  control={control}
                  unit={unit}
                  rules={{
                    required: true,
                    onBlur: () => {
                      handleSubmit(onSubmit);
                      setIsEditMode(false);
                    },
                  }}
                />
              ) : (
                <Typography
                  variant={(quantity || 0) > 999 ? "lBold" : "xlBold"}
                  style={styles.title}
                >
                  {/* liczba + jednostka current */}
                  {unit ? quantity + " " + unit : null}
                </Typography>
              )}
              <Button
                type="primary"
                size="xl"
                containerStyle={styles.editButton}
                // TODO: make the current quantity editable - convert to a text field with fixed jednostka
                onPress={() => {
                  setIsEditMode(true);
                  setFocus("quantityManual");
                }}
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
              <Button type="primary" size="l">
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
      flex: 1,
    },
    editButton: {
      marginTop: 24,
      borderRadius: 5,
      width: 72,
      height: 72,
      marginBottom: 58 + 12,
    },
    rightColumn: { flexDirection: "column", alignItems: "flex-end" },
  })
);
