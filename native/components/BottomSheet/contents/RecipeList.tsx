import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useListRecipes } from "../../../db/hooks/useListRecipes";
import { createStyles } from "../../../theme/useStyles";
import { Button } from "../../Button";
import { Typography } from "../../Typography";

export const RecipesListBottomSheetContent = ({
  closeBottomSheet,
  recipes,
  setValue,
  alias,
}: {
  closeBottomSheet: () => void;
  recipes: ReturnType<typeof useListRecipes>["data"];
  alias: string;
  setValue: (recipe_id: string, alias: string) => void;
}) => {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Typography style={styles.inputLabel} color="lightGrey">
          Wybierz produkt dla tej pozycji
        </Typography>
      </View>
      <View style={styles.recipesContainer}>
        {recipes?.map((recipe) => (
          <Button
            key={recipe.id}
            size="xs"
            type="primary"
            containerStyle={styles.button}
            onPress={() => {
              setValue(String(recipe.id), alias);
              closeBottomSheet();
            }}
          >
            {recipe.name}
          </Button>
        ))}
      </View>
    </View>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
      paddingTop: theme.spacing,
      paddingHorizontal: theme.spacing * 2,
    },
    inputLabel: {
      paddingBottom: theme.spacing,
      flexShrink: 1,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: theme.spacing,
    },
    // custom size lol :D
    button: { flexBasis: "47%", height: 64 },
    recipesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
  })
);
