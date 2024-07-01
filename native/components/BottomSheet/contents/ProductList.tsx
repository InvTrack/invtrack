import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as React from "react";
import { useForm } from "react-hook-form";
import { createStyles } from "../../../theme/useStyles";
import { useKeyboard } from "../../../utils/useKeyboard";
import { Button } from "../../Button";
import TextInputController from "../../TextInputController";
import { Typography } from "../../Typography";

type ProductListBottomSheetForm = { searchText: string };
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
  const {
    coordinates: {
      end: { height: keyboardHeight },
    },
  } = useKeyboard();
  const { height: windowHeight } = useWindowDimensions();

  const {
    control,
    setFocus: _setFocus,
    watch,
  } = useForm<ProductListBottomSheetForm>({
    defaultValues: {
      searchText: "",
    },
    mode: "onChange",
  });

  const sortedProducts = React.useMemo(
    () =>
      products.sort((a, b) => {
        const x = a.name.toLowerCase();
        const y = b.name.toLowerCase();
        return x.localeCompare(y);
      }),
    [products]
  );

  const searchText = watch("searchText");

  return (
    <View
      style={[
        styles.container,
        {
          minHeight: keyboardHeight + windowHeight / 3,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Typography style={styles.listLabel} color="lightGrey">
          Wybierz produkt dla tej pozycji
        </Typography>
      </View>
      <TextInputController
        control={control}
        name="searchText"
        textInputProps={{
          containerStyle: styles.searchInputContainer,
          placeholder: "Wyszukaj produkty",
        }}
      />
      <View style={styles.productsContainer}>
        {sortedProducts
          .filter((p) =>
            p.name
              .toLowerCase()
              .includes(searchText ? searchText.toLowerCase() : "")
          )
          .map((product) => (
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
    listLabel: {
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
    searchInputContainer: { marginBottom: 8 },
  })
);
