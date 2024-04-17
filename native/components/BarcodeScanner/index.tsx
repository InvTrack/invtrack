import {
  AutoFocus,
  BarCodeScanningResult,
  Camera,
  CameraType,
} from "expo-camera";

import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useListBarcodes } from "../../db/hooks/useListBarcodes";

import { appAction, appSelector } from "../../redux/appSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { BarcodeModalScreenProps } from "../../screens/BarcodeModalScreen";
import { createStyles } from "../../theme/useStyles";
import { getBestCameraRatio } from "../../utils";
import { CameraSwitchIcon } from "../Icon";
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

  const isCameraReady = useAppSelector(appSelector.selectIsCameraReady);
  const ratio = useAppSelector(appSelector.selectCameraRatio);
  const dispatch = useAppDispatch();

  const cameraRef = useRef<Camera>(null);
  const [alertShown, setAlertShown] = useState(false);
  const [type, setType] = useState(CameraType.back);
  const { data: barcodeList, isLoading } = useListBarcodes(inventoryId);

  // workaround to trigger refocuses on ios
  const [_, setAutoFocus] = useState(AutoFocus.on);
  const timeout = setTimeout(() => setAutoFocus(AutoFocus.on), 50);
  const updateCameraFocus = () => setAutoFocus(() => AutoFocus.off);
  useEffect(() => {
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    return () => {
      dispatch(appAction.SET_IS_CAMERA_READY({ isCameraReady: false }));
    };
  }, []);

  useEffect(() => {
    if (ratio || !isCameraReady) {
      return;
    }

    const getCameraRatio = async () => {
      if (!cameraRef?.current) {
        return;
      }
      try {
        const ratios = await cameraRef.current?.getSupportedRatiosAsync();
        const ratio = getBestCameraRatio(ratios);
        dispatch(appAction.SET_CAMERA_RATIO({ cameraRatio: ratio }));
      } catch (error) {
        console.log(error);
      }
    };

    getCameraRatio();
  }, [isCameraReady, ratio, cameraRef, dispatch]);

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const doubleTap = Gesture.Tap().numberOfTaps(2).onStart(toggleCameraType);
  const singleTap = Gesture.Tap().onStart(updateCameraFocus);
  const composedGestures = Gesture.Exclusive(doubleTap, singleTap);

  if (isLoading && !barcodeList) {
    return (
      <View style={styles.container}>
        <LoadingSpinner size={"large"} />
      </View>
    );
  }

  const handleBarcodeScan = (event: BarCodeScanningResult) => {
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
    <GestureDetector gesture={composedGestures}>
      <View style={styles.container}>
        {(!isCameraReady || ratio == null) && <LoadingSpinner size="large" />}
        <Camera
          ref={cameraRef}
          style={[
            (!isCameraReady || ratio == null) && { display: "none" },
            styles.camera,
          ]}
          // not displayed if null, as specified above
          ratio={ratio!}
          onCameraReady={() =>
            dispatch(appAction.SET_IS_CAMERA_READY({ isCameraReady: true }))
          }
          type={type}
          onBarCodeScanned={handleBarcodeScan}
        >
          <View style={styles.cameraFloatersContainer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={toggleCameraType}
              >
                <CameraSwitchIcon size={32} color="highlight" />
              </TouchableOpacity>
            </View>
            <Image
              style={styles.overlay}
              source={require("../../assets/images/barcode-scanner-overlay.png")}
            />
          </View>
        </Camera>
      </View>
    </GestureDetector>
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
    camera: {
      flex: 1,
    },
    buttonContainer: {
      position: "absolute",
      top: 32,
      right: 16,
      backgroundColor: "transparent",
    },
    button: {
      width: 64,
      height: 64,
      borderRadius: theme.borderRadiusFull,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
    },
    paddingH: {
      paddingHorizontal: theme.spacing,
    },
    cameraFloatersContainer: {
      flex: 1,
      justifyContent: "center",
    },
    overlay: { alignSelf: "center", width: 250, height: 250 },
  })
);
