import React from "react";
import { StyleSheet, View } from "react-native";

import { useBottomSheet } from "../../components/BottomSheet";
import { InputBottomSheetContent } from "../../components/BottomSheet/contents";
import { PencilIcon } from "../../components/Icon";
// import { useSnackbar } from "../../components/Snackbar/hooks";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Typography } from "../../components/common/Typography";
import { useListRecipes } from "../../db/hooks/useListRecipes";
import { createStyles } from "../../theme/useStyles";
import { useStockContext } from "./StockContext/StockContextProvider";

type RecipeCardProps = {
  name: string | null | undefined;
  recipePart:
    | null
    | NonNullable<
        ReturnType<typeof useListRecipes>["data"]
      >[number]["recipe_part"];
  inventoryId: number;
  recipeRecordId: number | null | undefined;
  recipeId: number;
  borderLeft?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
};

export const RecipeCard = ({
  name,
  recipeId,
  borderLeft = false,
  borderRight = false,
  borderBottom = false,
}: RecipeCardProps) => {
  const styles = useStyles();
  const { closeBottomSheet, openBottomSheet } = useBottomSheet();
  // WIP add back info about 0 quantity parts?
  // const { showInfo } = useSnackbar();
  const { recipeRecords, setRecipeQuantityWithProductQuantities } =
    useStockContext();
  const recipeRecord = recipeRecords[recipeId];

  if (!name) return null;

  const recipeQuantity = recipeRecord?.quantity || 0;

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
          variant={
            name.length > 28 ? (name.length > 44 ? "xsBold" : "sBold") : "lBold"
          }
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
          onPress={() =>
            setRecipeQuantityWithProductQuantities(recipeId)(recipeQuantity + 1)
          }
        >
          +
        </Button>
        <Button
          size="xs"
          type="secondary"
          labelStyle={styles.minusButtonLabel}
          containerStyle={styles.buttonContainer}
          onPress={() =>
            setRecipeQuantityWithProductQuantities(recipeId)(recipeQuantity - 1)
          }
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
                setQuantity={setRecipeQuantityWithProductQuantities(recipeId)}
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
      // height: 90,
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
