import * as Updates from "expo-updates";
import { StyleSheet, View } from "react-native";
import { Button } from "../components/Button";
import { AppIcon } from "../components/Icon";
import SafeLayout from "../components/SafeLayout";
import { Typography } from "../components/Typography";
import { isIos } from "../constants";
import { createStyles } from "../theme/useStyles";

export const UpdateRequiredScreen = () => {
  const styles = useStyles();
  const { isDownloading, isChecking, isUpdatePending } = Updates.useUpdates();

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
        {
          "Nowa wersja InvTrack jest dostępna - zaktualizuj aplikację, aby korzystać z nowych funkcji i poprawek. Nie musisz jej pobierać "
        }
        {isIos ? "z App Store" : "ze Sklepu Play"}
        {". Wystarczy, że potwierdzisz poniżej."}
      </Typography>
      <Button
        type="primary"
        size="m"
        fullWidth
        containerStyle={styles.button}
        isLoading={isDownloading || isChecking}
        disabled={isDownloading || isChecking}
        onPress={async () =>
          isUpdatePending ? await Updates.reloadAsync() : void this
        }
      >
        Aplikuj aktualizację
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
