import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStyles } from "../../../theme/useStyles";
import { Button } from "../../Button";
import { Typography } from "../../Typography";

export const ProductListBottomSheetContent = ({
  closeBottomSheet,
  products,
  setValue,
  alias,
}: {
  closeBottomSheet: () => void;
  products: { id: number; name: string }[];
  alias: string;
  setValue: (product_id: string, alias: string) => void;
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
      <View style={styles.productsContainer}>
        {products.map((product) => (
          <Button
            key={product.id}
            size="xs"
            type="primary"
            containerStyle={styles.button}
            onPress={() => {
              setValue(String(product.id), alias);
              closeBottomSheet();
            }}
          >
            {product.name}
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
    productsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
  })
);
