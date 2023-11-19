import { Camera } from "expo-camera";
import React from "react";
import { StyleSheet, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { BarcodeScanner } from "../components/BarcodeScanner";
import { Button } from "../components/Button";

import { Typography } from "../components/Typography";

import { useLocalSearchParams } from "expo-router";
import { useListBarcodes } from "../db/hooks/useListBarcodes";
import { createStyles } from "../theme/useStyles";

export default function BarcodeModal() {
  const styles = useStyles();

  const { inventoryId } = useLocalSearchParams<{ inventoryId: string }>();
  const { data } = useListBarcodes({ inventoryId: +inventoryId });

  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading
    console.log(data);
    return (
      <View
        style={{ backgroundColor: "#fff", width: "100%", height: "100%" }}
      />
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
      <BarcodeScanner />
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
