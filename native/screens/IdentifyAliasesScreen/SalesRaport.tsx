import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { UseFormGetValues, UseFormSetValue, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Badge } from "../../components/Badge";
import { useBottomSheet } from "../../components/BottomSheet";
import { RecipesListBottomSheetContent } from "../../components/BottomSheet/contents/RecipeList";
import { Button } from "../../components/Button";
import { DropdownButton } from "../../components/DropdownButton";
import { EmptyScreenTemplate } from "../../components/EmptyScreenTemplate";
import { IndexBadge } from "../../components/IndexBadge";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { Typography } from "../../components/Typography";
import { useCreateRecipeNameAlias } from "../../db/hooks/useCreateRecipeNameAlias";
import { useListRecipes } from "../../db/hooks/useListRecipes";
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
  (recipe_id: string, alias: string) => {
    const recipeAliases = getValues(recipe_id);

    if (aliasSet.has(alias)) {
      const entireFormValues = getValues();
      for (const recipe_id in entireFormValues) {
        if (recipe_id === "usedAliases") continue;
        if (
          entireFormValues[recipe_id]?.some((usedAlias) => usedAlias === alias)
        ) {
          setValue(recipe_id, [
            ...(recipeAliases?.filter((ua) => ua === alias) || []),
            alias,
          ]);
          showInfo("Alias został już ustalony dla innego produktu, nadpisano.");
          return void this;
        }
      }
      return void this;
    }
    setValue(recipe_id, [...(recipeAliases || []), alias]);
    aliasSet.add(alias);
    setValue("usedAliases", [...aliasSet]);
  };

export const IdentifyAliasesScreenSalesRaport = () => {
  const navigation = useNavigation<IdentifyAliasesScreenNavigationProp>();
  const { isConnected } = useNetInfo();
  const styles = useStyles();
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const { showInfo } = useSnackbar();

  const dispatch = useAppDispatch();
  const inventoryId = useAppSelector(documentScannerSelector.selectInventoryId);
  const aliases = useAppSelector(
    documentScannerSelector.selectSalesRaportUnmatchedAliases
  );

  const { data: recipes } = useListRecipes(inventoryId);
  const { mutate, isSuccess } = useCreateRecipeNameAlias();

  const { setValue, handleSubmit, watch, getValues } = useForm<AliasForm>({
    defaultValues: async () =>
      !!recipes
        ? recipes.reduce(
            (acc, { id: recipe_id }) => ({
              ...acc,
              [String(recipe_id)]: null,
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
        dispatch(documentScannerAction.PHOTO_RESET_DATA());
        dispatch(documentScannerAction.RESET_PROCESSED_SALES_RAPORT());
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
    dispatch(documentScannerAction.RESET_PROCESSED_SALES_RAPORT());
    dispatch(documentScannerAction.PHOTO_RETAKE());
    navigation.replace("DocumentScannerModal", {
      isScanningSalesRaport: true,
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
                <RecipesListBottomSheetContent
                  recipes={recipes!}
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
