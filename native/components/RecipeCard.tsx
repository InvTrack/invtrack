import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { useFormContext } from "react-hook-form";
import { useListRecipes } from "../db/hooks/useListRecipes";
import { useListRecords } from "../db/hooks/useListRecords";
import { createStyles } from "../theme/useStyles";
import { roundFloat } from "../utils";
import { useBottomSheet } from "./BottomSheet";
import { InputBottomSheetContent } from "./BottomSheet/contents";
import { Button } from "./Button";
import { Card } from "./Card";
import { DeliveryForm } from "./DeliveryFormContext/deliveryForm.types";
import { PencilIcon } from "./Icon";
import { InventoryForm } from "./InventoryFormContext/inventoryForm.types";
import { Typography } from "./Typography";

type RecipeCardProps = {
  name: string | null | undefined;
  id: number;
  recipePart:
    | null
    | NonNullable<
        ReturnType<typeof useListRecipes>["data"]
      >[number]["recipe_part"];
  inventoryId: number;
  borderLeft?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
};

export const RecipeCard = ({
  name,
  id: _id,
  recipePart,
  inventoryId,
  borderLeft = false,
  borderRight = false,
  borderBottom = false,
}: RecipeCardProps) => {
  const styles = useStyles();
  const { closeBottomSheet, openBottomSheet } = useBottomSheet();
  const { watch, setValue } = useFormContext<InventoryForm | DeliveryForm>();
  const { data: recordsList } = useListRecords(inventoryId);
  const [recipeQuantity, setRecipeQuantity] = useState(0);
  if (!name) {
    return null;
  }

  // value is an integer, see InputBottomSheetContent props
  const setQuantity = (value: number) => {
    if (value === recipeQuantity) return void this;
    const delta = value - recipeQuantity;

    if (delta === 0) return void this;

    // basically just value
    if (recipeQuantity + delta < 0) return void this;

    if (Array.isArray(recipePart)) {
      // this possibly falsely assumes that every product occurs only once per recipe
      const recordAndMultiplier = recipePart?.map((rp) => {
        const matchingRecord = recordsList?.find(
          (r) => r.product_id === rp.product_id
        );
        return {
          record_quantity_backup: matchingRecord?.quantity,
          record_id: matchingRecord?.id,
          product_id: matchingRecord?.product_id,
          multiplier: rp.quantity,
        };
      });
      recordAndMultiplier.forEach((ram) => {
        if (ram.record_id == null) return void this;

        const stringifiedRecordId = String(ram.record_id);

        // the object may not exist, if the user did not navigate to the given RecordScreen
        // may change during the form refactor
        const oldRecordValues = watch(`${stringifiedRecordId}`) || {
          price_per_unit: null,
          product_id: ram.product_id,
          quantity: ram.record_quantity_backup,
        };

        const dMultiplied = roundFloat(delta * ram.multiplier);
        const newRecordQuantity = roundFloat(
          oldRecordValues.quantity + dMultiplied
        );

        setValue(`${stringifiedRecordId}.quantity`, newRecordQuantity, {
          shouldDirty: true,
          shouldTouch: true,
        });
      });

      setRecipeQuantity(value);
      return void this;
    }
    /**
     * when a recipe contains only a single product
     */

    const recipePartRecord = recordsList.find(
      (r) => r.product_id === recipePart?.product_id
    );
    if (
      recipePartRecord?.id == null ||
      recipePartRecord?.product_id == null ||
      recipePartRecord?.quantity == null ||
      recipePart?.quantity == null
    )
      return void this;

    const stringifiedRecordId = String(recipePartRecord.id);

    // the object may not exist, if the user did not navigate to the given RecordScreen
    // may change during the form refactor
    const oldRecordValues = watch(stringifiedRecordId) || {
      price_per_unit: null,
      product_id: recipePartRecord.product_id,
      quantity: recipePartRecord.quantity,
    };

    const dMultiplied = roundFloat(delta * recipePart.quantity);
    const newRecordQuantity = roundFloat(
      oldRecordValues.quantity + dMultiplied
    );
    setValue(`${stringifiedRecordId}.quantity`, newRecordQuantity, {
      shouldDirty: true,
      shouldTouch: true,
    });

    setRecipeQuantity(value);
    return void this;
  };

  return (
    <View
      style={[
        borderLeft ? styles.borderLeft : null,
        borderRight ? styles.borderRight : null,
        borderBottom ? styles.borderBottom : null,
      ]}
    >
      <Card color="mediumBlue" style={styles.card} padding="none">
        <Typography
          color="lightGrey"
          variant="sBold"
          numberOfLines={4}
          textProps={{ lineBreakMode: "tail", ellipsizeMode: "tail" }}
          style={styles.textLeft}
        >
          {name}
        </Typography>
        <Button
          size="xs"
          type="secondary"
          labelStyle={styles.plusButtonLabel}
          containerStyle={styles.buttonContainer}
          onPress={() => setQuantity(recipeQuantity + 1)}
        >
          +
        </Button>
        <Button
          size="xs"
          type="secondary"
          labelStyle={styles.minusButtonLabel}
          containerStyle={styles.buttonContainer}
          onPress={() => setQuantity(recipeQuantity - 1)}
        >
          -
        </Button>
        <Button
          size="xs"
          type="secondary"
          labelStyle={styles.pencilButtonLabel}
          containerStyle={styles.buttonContainer}
          onPress={() =>
            openBottomSheet(() => (
              <InputBottomSheetContent
                closeBottomSheet={closeBottomSheet}
                quantity={recipeQuantity}
                setQuantity={setQuantity}
                shouldAllowFloatAsValue={false}
              />
            ))
          }
        >
          <PencilIcon color="lightGrey" />
        </Button>
        <Typography
          color="lightGrey"
          variant={"lBold"}
          style={styles.textRight}
        >
          {recipeQuantity}
        </Typography>
      </Card>
    </View>
  );
};
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    borderLeft: {
      paddingLeft: theme.spacing,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.highlight,
    },
    borderRight: {
      paddingRight: theme.spacing,
      borderRightWidth: 3,
      borderRightColor: theme.colors.highlight,
    },
    borderBottom: {
      paddingRight: 8,
      borderBottomWidth: 3,
      borderBottomColor: theme.colors.highlight,
      borderBottomLeftRadius: theme.borderRadiusSmall,
      borderBottomRightRadius: theme.borderRadiusSmall,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing * 2,
      paddingRight: theme.spacing * 2,
      marginBottom: theme.spacing,
      marginTop: theme.spacing,
      height: 90,
      borderRadius: theme.borderRadiusSmall,
    },
    textLeft: { flex: 1 },
    textRight: {
      marginLeft: theme.spacing,
    },
    buttonContainer: {
      paddingHorizontal: 4,
      paddingVertical: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    plusButtonLabel: {
      fontSize: 30,
      fontWeight: "900",
      lineHeight: 30,
    },
    minusButtonLabel: {
      fontSize: 40,
      fontWeight: "900",
      lineHeight: 35,
    },
    pencilButtonLabel: {
      fontSize: 30,
      fontWeight: "900",
      lineHeight: 30,
    },
  })
);
