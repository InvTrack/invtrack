import { Camera } from "expo-camera";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { BarcodeScanner } from "../components/BarcodeScanner";
import { Button } from "../components/Button";

import { Typography } from "../components/Typography";

import { useLocalSearchParams } from "expo-router";
import { createStyles } from "../theme/useStyles";

export default function BarcodeModal() {
  const styles = useStyles();

  const { inventoryId } = useLocalSearchParams<{ inventoryId: string }>();

  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!permission?.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={styles.container}
      >
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
      <BarcodeScanner inventoryId={+inventoryId} />
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
