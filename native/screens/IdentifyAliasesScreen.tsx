import { useNetInfo } from "@react-native-community/netinfo";
import isEmpty from "lodash/isEmpty";
import { useContext } from "react";
import { UseFormGetValues, UseFormSetValue, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { Badge } from "../components/Badge";
import { useBottomSheet } from "../components/BottomSheet";
import { ProductListBottomSheetContent } from "../components/BottomSheet/contents/ProductList";
import { Button } from "../components/Button";
import { DocumentScannerContext } from "../components/DocumentScanner/DocumentScannerContext";
import { DropdownButton } from "../components/DropdownButton";
import { EmptyScreenTemplate } from "../components/EmptyScreenTemplate";
import SafeLayout from "../components/SafeLayout";
import { Typography } from "../components/Typography";
import { useCreateProductNameAlias } from "../db/hooks/useCreateProductNameAlias";
import { useListExistingProducts } from "../db/hooks/useListProducts";
import { IdentifyAliasesScreenProps } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

export type AliasForm = (
  | {
      // stringified product_id
      [product_id: string]: string[] | null; //alias
    }
  | {}
) & { usedAliases: string[] };

// unique
const aliasSet = new Set<string>([]);
const setAlias =
  (
    setValue: UseFormSetValue<AliasForm>,
    getValues: UseFormGetValues<AliasForm>
  ) =>
  (product_id: string, alias: string) => {
    const productAliases = getValues(product_id);
    setValue(product_id, [...(productAliases || []), alias]);
    aliasSet.add(alias);
    setValue("usedAliases", [...aliasSet]);
  };
export const IdentifyAliasesScreen = ({}: IdentifyAliasesScreenProps) => {
  const { isConnected } = useNetInfo();
  const styles = useStyles();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  const { state } = useContext(DocumentScannerContext);
  const { data: products } = useListExistingProducts();
  const { mutate } = useCreateProductNameAlias();
  const aliases = state.processedInvoice?.unmatchedAliases;

  const { setValue, handleSubmit, watch, getValues } = useForm<AliasForm>({
    defaultValues: async () =>
      !!products
        ? products.reduce(
            (acc, { id: product_id }) => ({
              ...acc,
              [String(product_id)]: null,
            }),
            { usedAliases: [] } as AliasForm
          )
        : { usedAliases: [] },
  });

  const usedAliases = watch("usedAliases");

  const handlePress = () => {
    handleSubmit(
      (data) => {
        mutate(data);
      },
      (_errors) => {
        // TODO show a snackbar? handle error better
        console.log("error", _errors);
      }
    )();
  };

  if (isEmpty(aliases) || !aliases) {
    // error
    return (
      <EmptyScreenTemplate style={styles.container}>
        Błąd - brak aliasów do wyświetlenia
      </EmptyScreenTemplate>
    );
  }

  return (
    <SafeLayout
      style={[styles.container, styles.bg]}
      containerStyle={styles.bg}
      contentContainerStyle={styles.bg}
      scrollable
    >
      <Button
        containerStyle={styles.saveButtonContainer}
        size="l"
        type="primary"
        fullWidth
        onPress={handlePress}
        disabled={!isConnected}
      >
        Zapisz zmiany
      </Button>
      {aliases.map((alias, i) => (
        <>
          <Badge isShown={usedAliases?.includes(alias)} />
          <DropdownButton
            key={i}
            containerStyle={{ marginBottom: 8, marginTop: -4 }}
            onPress={() =>
              openBottomSheet(() => (
                <ProductListBottomSheetContent
                  products={products!.map((product) => ({
                    id: product.id,
                    name: product.name,
                  }))}
                  alias={alias}
                  closeBottomSheet={closeBottomSheet}
                  setValue={setAlias(setValue, getValues)}
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
        </>
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
    saveButtonContainer: {
      flexShrink: 1,
    },
    badgePosition: {
      position: "relative",
      top: 6,
      left: 5,
      zIndex: 10,
    },
    badgeSize: {
      borderRadius: 20,
      height: 20,
      width: 20,
    },
    badge: {
      padding: 2,
      backgroundColor: theme.colors.green,
    },
  })
);
