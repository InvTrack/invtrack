// import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UseFormSetValue } from "react-hook-form";
import { AliasForm } from "../../../screens/IdentifyAliasesScreen";
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
  setValue: UseFormSetValue<AliasForm>;
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
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {products.map((product) => (
          <Button
            size="xs"
            type="primary"
            // custom size lol :D
            containerStyle={{ flexBasis: "45%", height: 64 }}
            onPress={() => {
              setValue(`${alias}`, product.id);
              closeBottomSheet();
            }}
          >
            {product.name + "fagdsatew4taqafwefwaq243"}
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
    button: {
      width: "30%",
    },
  })
);
