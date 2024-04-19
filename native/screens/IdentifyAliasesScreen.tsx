import { useNetInfo } from "@react-native-community/netinfo";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { UseFormGetValues, UseFormSetValue, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Badge } from "../components/Badge";
import { useBottomSheet } from "../components/BottomSheet";
import { ProductListBottomSheetContent } from "../components/BottomSheet/contents/ProductList";
import { Button } from "../components/Button";
import { DropdownButton } from "../components/DropdownButton";
import { EmptyScreenTemplate } from "../components/EmptyScreenTemplate";
import SafeLayout from "../components/SafeLayout";
import { useSnackbar } from "../components/Snackbar/hooks";
import { Typography } from "../components/Typography";
import { useCreateProductNameAlias } from "../db/hooks/useCreateProductNameAlias";
import { useListExistingProducts } from "../db/hooks/useListProducts";
import { IdentifyAliasesScreenProps } from "../navigation/types";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createStyles } from "../theme/useStyles";

export type AliasForm = {
  // stringified product_id
  [product_id: string]: string[] | null; //alias
} & { usedAliases: string[] };

// unique
const aliasSet = new Set<string>([]);
const setAlias =
  (
    setValue: UseFormSetValue<AliasForm>,
    getValues: UseFormGetValues<AliasForm>,
    showInfo: ReturnType<typeof useSnackbar>["showInfo"]
  ) =>
  (product_id: string, alias: string) => {
    const productAliases = getValues(product_id);

    if (aliasSet.has(alias)) {
      const entireFormValues = getValues();
      for (const product_id in entireFormValues) {
        if (product_id === "usedAliases") continue;
        if (
          entireFormValues[product_id]?.some((usedAlias) => usedAlias === alias)
        ) {
          setValue(product_id, [
            ...(productAliases?.filter((ua) => ua === alias) || []),
            alias,
          ]);
          showInfo("Alias został już ustalony dla innego produktu, nadpisano.");
          return void this;
        }
      }
      return void this;
    }
    setValue(product_id, [...(productAliases || []), alias]);
    aliasSet.add(alias);
    setValue("usedAliases", [...aliasSet]);
  };

export const IdentifyAliasesScreen = ({
  navigation,
}: IdentifyAliasesScreenProps) => {
  const { isConnected } = useNetInfo();
  const styles = useStyles();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const { showInfo } = useSnackbar();
  const dispatch = useAppDispatch();

  const { data: products } = useListExistingProducts();
  const { mutate, isSuccess } = useCreateProductNameAlias();
  const aliases = useAppSelector(
    documentScannerSelector.selectUnmatchedAliases
  );

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
  useEffect(() => {
    if (isSuccess) {
      navigation.goBack();
    }
  }, [isSuccess]);

  const handleSavePress = () => {
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
  const handleGoBackPress = () => {
    dispatch(documentScannerAction.PHOTO_RESET_DATA());
    dispatch(documentScannerAction.RESET_INVOICE_PROCESSING_RESULT());
    navigation.replace("DocumentScannerModal", {
      isScanningSalesRaport: false,
    });
  };
  if (isEmpty(aliases) || !aliases) {
    // error
    return (
      <EmptyScreenTemplate>
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
      <View style={{ flexDirection: "row" }}>
        <Button
          containerStyle={styles.saveButtonContainer}
          size="l"
          type="primary"
          fullWidth
          onPress={handleGoBackPress}
        >
          Wróć do skanera
        </Button>
        <Button
          containerStyle={styles.saveButtonContainer}
          size="l"
          type="primary"
          fullWidth
          onPress={handleSavePress}
          disabled={!isConnected}
        >
          Zapisz zmiany
        </Button>
      </View>
      {aliases.map((alias, i) => (
        <>
          <Badge isShown={usedAliases?.includes(alias)} key={`b${i}`} />
          <DropdownButton
            key={i}
            containerStyle={styles.dropdown}
            onPress={() =>
              openBottomSheet(() => (
                <ProductListBottomSheetContent
                  products={products!}
                  alias={alias}
                  closeBottomSheet={closeBottomSheet}
                  setValue={setAlias(setValue, getValues, showInfo)}
                />
              ))
            }
          >
            <Typography
              color="lightGrey"
              numberOfLines={2}
              variant={alias.length > 50 ? "xs" : "s"}
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
    dropdown: { marginBottom: theme.spacing, marginTop: -theme.spacing },
    saveButtonContainer: {
      marginTop: theme.spacing * 2,
      flexShrink: 1,
    },
  })
);
