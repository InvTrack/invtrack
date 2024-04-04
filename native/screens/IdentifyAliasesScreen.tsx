import isEmpty from "lodash/isEmpty";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { useBottomSheet } from "../components/BottomSheet";
import { ProductListBottomSheetContent } from "../components/BottomSheet/contents/ProductList";
import { DocumentScannerContext } from "../components/DocumentScanner/DocumentScannerContext";
import { DropdownButton } from "../components/DropdownButton";
import SafeLayout from "../components/SafeLayout";
import { Typography } from "../components/Typography";
import { useListExistingProducts } from "../db/hooks/useListProducts";
import { IdentifyAliasesScreenProps } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

export type AliasForm = {
  [alias: string]: number | null; //product_id
};

export const IdentifyAliasesScreen = ({}: IdentifyAliasesScreenProps) => {
  const styles = useStyles();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  const { state } = useContext(DocumentScannerContext);
  const { data: products } = useListExistingProducts();

  const aliases = state.processedInvoice?.unmatchedAliases;

  const { setValue, watch } = useForm<AliasForm>({
    defaultValues: aliases!.reduce(
      (acc, alias) => ({ ...acc, [alias]: null }),
      {} as AliasForm
    ),
  });
  // ehh
  // we need to sanitize strings, as in replace all . with @replaceDOT@,
  // then while making the requests, replace it back
  // gotta love object dot notation and user provided strings

  console.log(watch());

  if (isEmpty(aliases) || !aliases) {
    // error, display back button
    return <SafeLayout style={styles.container}></SafeLayout>;
  }

  return (
    <SafeLayout
      style={[styles.container, styles.bg]}
      containerStyle={styles.bg}
      contentContainerStyle={styles.bg}
      scrollable
    >
      {aliases.map((alias, i) => (
        <DropdownButton
          key={i}
          containerStyle={{ marginVertical: 8 }}
          onPress={() =>
            openBottomSheet(() => (
              <ProductListBottomSheetContent
                products={products!.map((product) => ({
                  id: product.id,
                  name: product.name,
                }))}
                alias={alias}
                closeBottomSheet={closeBottomSheet}
                setValue={setValue}
              />
            ))
          }
        >
          <Typography
            color="lightGrey"
            numberOfLines={2}
            variant={alias.length > 40 ? "xs" : "s"}
          >
            {alias}
          </Typography>
        </DropdownButton>
      ))}
    </SafeLayout>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    bg: {
      backgroundColor: theme.colors.darkBlue,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.colors.darkBlue,
      height: "100%",
      paddingHorizontal: theme.spacing * 2,
    },
  })
);
