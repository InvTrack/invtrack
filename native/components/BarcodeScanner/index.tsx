import { useNavigation } from "@react-navigation/native";
import { BarcodeScanningResult, CameraView as ExpoCamera } from "expo-camera";
import React, { useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useListBarcodes } from "../../db/hooks/useListBarcodes";
import { Camera } from "../Camera";

import { BarcodeModalScreenProps } from "../../screens/BarcodeModalScreen";
import { createStyles } from "../../theme/useStyles";
import { LoadingSpinner } from "../LoadingSpinner";

export const BarcodeScanner = ({
  inventoryId,
  navigateTo: _navigateTo,
}: {
  inventoryId: number;
  navigateTo: "DeliveryTab" | "InventoryTab";
}) => {
  const styles = useStyles();
  const navigation = useNavigation<BarcodeModalScreenProps["navigation"]>();
  const cameraRef = useRef<ExpoCamera>(null);
  const [alertShown, setAlertShown] = useState(false);
  const { data: barcodeList, isLoading } = useListBarcodes(inventoryId);

  if (isLoading && !barcodeList) {
    return (
      <View style={styles.container}>
        <LoadingSpinner size={"large"} />
      </View>
    );
  }

  const handleBarcodeScan = (event: BarcodeScanningResult) => {
    const { data } = event;
    const barcodeMappedToId = barcodeList?.[data];
    if (!barcodeMappedToId) {
      !alertShown &&
        Alert.alert("Nie znaleziono kodu kreskowego", "", [
          {
            text: "Cofnij",
            onPress: () => {
              navigation.goBack();
            },
          },
          {
            text: "Dodaj kod kreskowy",
            onPress: () => {
              // close the scanner
              navigation.goBack();

              navigation.navigate("NewBarcodeScreen", {
                new_barcode: data,
                inventoryId,
              });
              return;
            },
          },
        ]);
      setAlertShown(true);
      return;
    }

    // FIXME do it properly with navigation
    // @ts-ignore
    navigation.navigate("RecordScreen", {
      id: inventoryId,
      recordId: barcodeMappedToId,
    });
  };

  return (
    <Camera
      ref={cameraRef}
      onBarcodeScanned={handleBarcodeScan}
      shouldShowScannerOverlay
      shouldAllowCameraToggle
    />
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.colors.darkBlue,
      height: "100%",
    },
  })
);
