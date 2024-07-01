import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { UseFormGetValues, UseFormSetValue, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Badge } from "../../components/Badge";
import { useBottomSheet } from "../../components/BottomSheet";
import { ProductListBottomSheetContent } from "../../components/BottomSheet/contents/ProductList";
import { Button } from "../../components/Button";
import { DropdownButton } from "../../components/DropdownButton";
import { EmptyScreenTemplate } from "../../components/EmptyScreenTemplate";
import { IDListCardAddProduct } from "../../components/IDListCardAddProduct";
import { IndexBadge } from "../../components/IndexBadge";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { Typography } from "../../components/Typography";
import { useListProductRecords } from "../../db";
import { useCreateProductNameAlias } from "../../db/hooks/useCreateProductNameAlias";
import { useListExistingProducts } from "../../db/hooks/useListProducts";
import { IdentifyAliasesScreenNavigationProp } from "../../navigation/types";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createStyles } from "../../theme/useStyles";
import { AliasForm } from "./types";

const BADGE_SIDE_SIZE = 20;
const PADDING = 4;

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

export const IdentifyAliasesScreenInvoice = () => {
  const navigation = useNavigation<IdentifyAliasesScreenNavigationProp>();
  const { isConnected } = useNetInfo();
  const styles = useStyles();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const { showInfo } = useSnackbar();
  const { data: products } = useListExistingProducts();
  const {
    mutate,
    isSuccess,
    data: resolvedAliases,
  } = useCreateProductNameAlias();

  const dispatch = useAppDispatch();
  const inventoryId = useAppSelector(documentScannerSelector.selectInventoryId);
  const aliases = useAppSelector(
    documentScannerSelector.selectInvoiceUnmatchedAliases
  );

  const processedInvoice = useAppSelector(
    documentScannerSelector.selectProcessedInvoice
  );

  const { data: productRecords } = useListProductRecords(inventoryId as number);

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
      if (processedInvoice) {
        let newMatched: typeof processedInvoice.form = [];

        for (const name in processedInvoice.unmatched) {
          const { price_per_unit, quantity } = processedInvoice.unmatched[name];
          const alias = resolvedAliases?.find((alias) => alias.alias === name);
          if (!alias || !alias.product_id) continue;
          const { product_id } = alias;

          const record = productRecords?.find(
            (r) => r.product_id === product_id
          );
          if (!record || !record.id) continue;

          newMatched[record.id] = { price_per_unit, quantity, product_id };
        }

        dispatch(documentScannerAction.SET_NEW_MATCHED({ newMatched }));
      }
      dispatch(documentScannerAction.RESET_PROCESSED_INVOICE());
      navigation.goBack();
    }
  }, [isSuccess]);

  const handleSavePress = () => {
    handleSubmit(
      (data) => {
        // New alisases are inserted into the db here
        mutate(data);
        dispatch(documentScannerAction.PHOTO_RESET_DATA());
        // dispatch(documentScannerAction.RESET_PROCESSED_INVOICE());
        dispatch(documentScannerAction.PHOTO_RETAKE());
      },
      (_errors) => {
        // TODO show a snackbar? handle error better
        console.log("error", _errors);
      }
    )();
  };
  const handleGoBackPress = () => {
    dispatch(documentScannerAction.PHOTO_RESET_DATA());
    dispatch(documentScannerAction.RESET_PROCESSED_INVOICE());
    dispatch(documentScannerAction.PHOTO_RETAKE());
    navigation.replace("DocumentScannerModal", {
      isScanningSalesRaport: false,
    });
  };

  if (isEmpty(aliases) || !aliases) {
    // error
    return (
      <EmptyScreenTemplate>
        <Typography variant="l" color="lightGrey" align="center">
          Błąd - brak aliasów do wyświetlenia.
        </Typography>
        <Button
          size="l"
          type="primary"
          fullWidth
          onPress={() => {
            dispatch(documentScannerAction.PHOTO_RESET_DATA());
            dispatch(documentScannerAction.RESET_PROCESSED_SALES_RAPORT());
            dispatch(documentScannerAction.RESET_PROCESSED_INVOICE());
            navigation.goBack();
          }}
          containerStyle={{ marginTop: 16 }}
        >
          Resetuj skaner
        </Button>
      </EmptyScreenTemplate>
    );
  }
  return (
    <>
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
      <IDListCardAddProduct inventoryId={inventoryId} />
      {aliases.map((alias, i) => (
        <View key={i}>
          <Badge
            containerStyle={styles.checkmarkBadgePosition}
            isShown={usedAliases?.includes(alias)}
          />
          <IndexBadge
            containerStyle={styles.indexBadgePosition}
            index={i + 1}
          />
          <DropdownButton
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
        </View>
      ))}
    </>
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
    dropdown: { marginTop: -theme.spacing * 3 },
    saveButtonContainer: {
      marginTop: theme.spacing * 2,
      flexShrink: 1,
    },
    checkmarkBadgePosition: {
      position: "relative",
      top: BADGE_SIDE_SIZE - 10,
      left: BADGE_SIDE_SIZE + PADDING + 5,
      zIndex: 10,
    },
    indexBadgePosition: {
      position: "relative",
      top: -10,
      left: 5,
      zIndex: 10,
    },
  })
);
