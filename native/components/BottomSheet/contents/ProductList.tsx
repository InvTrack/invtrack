import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as React from "react";
import { useForm } from "react-hook-form";
import { isAndroid } from "../../../constants";
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
  const searchText = watch("searchText");

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          height: isAndroid ? undefined : keyboardHeight + 256,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Typography style={styles.inputLabel} color="lightGrey">
          Wybierz produkt dla tej pozycji
        </Typography>
      </View>
      <TextInputController
        control={control}
        name="searchText"
        shouldDebounce={true}
      />
      <View style={styles.productsContainer}>
        {products
          .filter((p) =>
            p.name
              .toLowerCase()
              .includes(searchText ? searchText.toLowerCase() : "")
          )
          .sort((a, b) => {
            const x = a.name.toLowerCase();
            const y = b.name.toLowerCase();
            return x.localeCompare(y);
          })
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
    </KeyboardAvoidingView>
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
