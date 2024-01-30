import { Camera } from "expo-camera";
import React from "react";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { BarcodeScanner } from "../components/BarcodeScanner";
import { Button } from "../components/Button";

import { Typography } from "../components/Typography";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

export type BarcodeModalScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "BarcodeModal"
>;

export function BarcodeModalScreen({ route }: BarcodeModalScreenProps) {
  const styles = useStyles();

  const { inventoryId, navigateTo } = route.params;
  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!permission?.granted && !permission?.canAskAgain) {
    // Camera permissions are not granted and can not be asked again
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <Typography
          variant="l"
          color="darkBlue"
          style={{ textAlign: "center" }}
        >
          Aby skorzystać ze skanera kodów, pozwól aplikacji na dostęp do kamery.
        </Typography>
        <Typography
          variant="l"
          color="darkBlue"
          style={{
            textAlign: "center",
            marginTop: 32,
            alignSelf: "center",
          }}
        >
          Zmień to w ustawieniach telefonu.
        </Typography>
        <Button
          onPress={Linking.openSettings}
          size="l"
          type="primary"
          shadow
          containerStyle={{ marginTop: 32, width: 200, alignSelf: "center" }}
        >
          Ustawienia
        </Button>
      </SafeAreaView>
    );
  }

  if (!permission?.granted && permission?.canAskAgain) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={styles.container}>
        <Typography
          variant="l"
          color="darkBlue"
          style={{ textAlign: "center" }}
        >
          Aby skorzystać ze skanera kodów, pozwól aplikacji na dostęp do kamery.
        </Typography>
        <Button
          onPress={requestPermission}
          size="l"
          type="primary"
          shadow
          containerStyle={{ marginTop: 16, width: 200, alignSelf: "center" }}
        >
          Zapytaj o dostęp
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <BarcodeScanner inventoryId={+inventoryId} navigateTo={navigateTo} />
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.colors.lightBlue,
      height: "100%",
    },
  })
);
