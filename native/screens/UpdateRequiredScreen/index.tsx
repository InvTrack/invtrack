import { useQueryClient } from "@tanstack/react-query";
import * as Updates from "expo-updates";
import { Linking, StyleSheet, View } from "react-native";
import { Button } from "../../components/Button";
import { AppIcon } from "../../components/Icon";
import SafeLayout from "../../components/SafeLayout";
import { Typography } from "../../components/Typography";
import { isIos } from "../../constants";
import { useCheckIfNativeUpdateNeeded } from "../../db/hooks/useCheckIfNativeUpdateNeeded";
import { createStyles } from "../../theme/useStyles";
const runtimeUpdateMessage =
  "Nowa wersja InvTrack jest dostępna - zaktualizuj aplikację, aby korzystać z nowych funkcji i poprawek. Nie musisz jej pobierać " +
  (isIos ? "z App Store" : "ze Sklepu Play") +
  ". Wystarczy, że potwierdzisz poniżej.";

const nativeUpdateMessage =
  "Nowa wersja InvTrack jest dostępna - zaktualizuj aplikację, aby korzystać z nowych funkcji i poprawek. Pobierz ją " +
  (isIos ? "z App Store" : "ze Sklepu Play") +
  " już teraz.";

const appStoreLink = "https://apps.apple.com/pl/app/id6479214636";
const playStoreLink =
  "https://play.google.com/store/apps/details?id=app.invtrack.invtrack";

export const UpdateRequiredScreen = () => {
  // TODO: remove on next+next (?) update
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["recipeList"] });

  const styles = useStyles();
  const { data: isNativeUpdateNeeded } = useCheckIfNativeUpdateNeeded();
  const { isDownloading, isChecking, isUpdatePending } = Updates.useUpdates();

  const handleAppReloadSafely = async () => {
    if (isUpdatePending) {
      await Updates.reloadAsync();
    }
    return void this;
  };
  return (
    <SafeLayout
      containerStyle={styles.container}
      style={styles.layout}
      insetTop
      insetBottom
    >
      <View style={styles.logoContainer}>
        <AppIcon size={150} />
      </View>
      <Typography
        color="lightGrey"
        variant="lBold"
        align="left"
        style={styles.updateText}
      >
        Zaktualizuj aplikację do najnowszej wersji
      </Typography>
      <Typography
        color="lightGrey"
        variant="s"
        align="left"
        style={styles.updateText}
      >
        {isNativeUpdateNeeded ? nativeUpdateMessage : runtimeUpdateMessage}
      </Typography>
      <Button
        type="primary"
        size="m"
        fullWidth
        containerStyle={styles.button}
        isLoading={isDownloading || isChecking}
        disabled={isDownloading || isChecking}
        onPress={
          isNativeUpdateNeeded
            ? () => Linking.openURL(isIos ? appStoreLink : playStoreLink)
            : handleAppReloadSafely
        }
      >
        {isNativeUpdateNeeded
          ? isIos
            ? "Otwórz App Store"
            : "Otwórz Sklep Play"
          : "Aplikuj aktualizację"}
      </Button>
    </SafeLayout>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing * 2,
      backgroundColor: theme.colors.darkBlue,
    },
    layout: {
      marginTop: "20%",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    logoImage: {
      width: 249 / 2.2,
      height: 228 / 2.2,
    },
    logoText: {
      fontSize: 56,
      fontFamily: "latoBold",
      paddingTop: theme.spacing * 5,
    },
    updateText: {
      marginTop: theme.spacing * 2,
    },
    button: {
      marginTop: theme.spacing * 4,
    },
  })
);
