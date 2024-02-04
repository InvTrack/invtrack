import { BarCodeScanningResult, Camera, CameraType, Point } from "expo-camera";

import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useListBarcodes } from "../../db/hooks/useListBarcodes";

import { BarcodeModalScreenProps } from "../../screens/BarcodeModalScreen";
import { createStyles } from "../../theme/useStyles";
import { CameraSwitchIcon } from "../Icon";
import { LoadingSpinner } from "../LoadingSpinner";
import { Typography } from "../Typography";
import { BarcodeOutline } from "./BarcodeOutline";

const setCornerXY =
  (animatedX: Animated.Value, animatedY: Animated.Value) => (value: Point) =>
    Animated.parallel([
      Animated.timing(animatedX, {
        toValue: value.x,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedY, {
        toValue: value.y,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

export const BarcodeScanner = ({
  inventoryId,
  navigateTo: _navigateTo,
}: {
  inventoryId: number;
  navigateTo: "DeliveryTab" | "InventoryTab";
}) => {
  const styles = useStyles();
  const navigation = useNavigation<BarcodeModalScreenProps["navigation"]>();

  const [type, setType] = useState(CameraType.back);
  const animatedTLCornerX = useRef(new Animated.Value(0));
  const animatedTLCornerY = useRef(new Animated.Value(0));
  const animatedBLCornerX = useRef(new Animated.Value(0));
  const animatedBLCornerY = useRef(new Animated.Value(0));
  const animatedBRCornerX = useRef(new Animated.Value(0));
  const animatedBRCornerY = useRef(new Animated.Value(0));
  const animatedTRCornerX = useRef(new Animated.Value(0));
  const animatedTRCornerY = useRef(new Animated.Value(0));
  const [alertShown, setAlertShown] = useState(false);

  const { data: barcodeList, isLoading } = useListBarcodes(inventoryId);

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };
  const doubleTap = Gesture.Tap().numberOfTaps(2).onStart(toggleCameraType);

  const setTLCornerAnimation = setCornerXY(
    animatedTLCornerX.current,
    animatedTLCornerY.current
  );
  const setBLCornerAnimation = setCornerXY(
    animatedBLCornerX.current,
    animatedBLCornerY.current
  );
  const setBRCornerAnimation = setCornerXY(
    animatedBRCornerX.current,
    animatedBRCornerY.current
  );
  const setTRCornerAnimation = setCornerXY(
    animatedTRCornerX.current,
    animatedTRCornerY.current
  );

  const setCorners = (corners: Point[]) => {
    setTLCornerAnimation(corners[0]);
    setBLCornerAnimation(corners[1]);
    setBRCornerAnimation(corners[2]);
    setTRCornerAnimation(corners[3]);
  };

  if (!isLoading && !barcodeList) {
    return (
      <View style={styles.container}>
        <LoadingSpinner size={"large"} />
      </View>
    );
  }

  if (!isLoading && !barcodeList) {
    return (
      <View style={[styles.container, styles.paddingH]}>
        <Typography
          align="center"
          color="new_darkGrey"
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Nie znaleziono kodów kreskowych dla tej inwentaryzacji
        </Typography>
      </View>
    );
  }

  const handleBarcodeScan = (event: BarCodeScanningResult) => {
    const { cornerPoints, data } = event;
    setCorners(cornerPoints);
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
              navigation.navigate("NewBarcodeScreen", {
                new_barcode: data,
                inventoryId,
              });
            },
          },
        ]);
      setAlertShown(true);
      return;
    }

    // FIXME do it properly with navigation
    // @ts-ignore
    navigation.navigate("RecordScreen", { id, recordId: barcodeMappedToId });
  };

  return (
    <GestureDetector gesture={doubleTap}>
      <Camera
        style={styles.camera}
        type={type}
        onBarCodeScanned={handleBarcodeScan}
      >
        <BarcodeOutline
          animatedTLCornerX={animatedTLCornerX}
          animatedTLCornerY={animatedTLCornerY}
          animatedBLCornerX={animatedBLCornerX}
          animatedBLCornerY={animatedBLCornerY}
          animatedBRCornerX={animatedBRCornerX}
          animatedBRCornerY={animatedBRCornerY}
          animatedTRCornerX={animatedTRCornerX}
          animatedTRCornerY={animatedTRCornerY}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <CameraSwitchIcon size={32} color="new_highlight" />
          </TouchableOpacity>
        </View>
      </Camera>
    </GestureDetector>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.colors.new_darkBlue,
      height: "100%",
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      marginTop: 32,
      marginRight: 16,
      justifyContent: "flex-end",
      alignItems: "flex-start",
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
  })
);
