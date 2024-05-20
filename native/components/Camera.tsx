import { CameraType, CameraView as ExpoCamera } from "expo-camera";

import React, { ComponentProps, forwardRef, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { isIos } from "../constants";
import { appAction, appSelector } from "../redux/appSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createStyles } from "../theme/useStyles";
import { CameraSwitchIcon, InfoIcon } from "./Icon";
import { LoadingSpinner } from "./LoadingSpinner";

type CameraProps = {
  onBarcodeScanned?: ComponentProps<typeof ExpoCamera>["onBarcodeScanned"];
  onTakePhoto?: () => void | Promise<void>;
  shouldShowTakePhotoButton?: boolean;
  shouldAllowCameraToggle?: boolean;
  shouldShowInfoPageIcon?: boolean;
  shouldShowScannerOverlay?: boolean;
};

const askToOpenInfoPage = () => {
  Alert.alert(
    "Przejdź do strony internetowej InvTrack",
    "Przygotowaliśmy krótkie porady, dzięki którym zminimalizujesz błędy skanera AI, i ułatwisz sobie pracę!",
    [
      {
        text: "Wróć",
      },
      {
        text: "Przejdź",
        onPress: () => {
          Linking.openURL("https://invtrack.app/jak-dobrze-wykonywac-skany");
        },
      },
    ]
  );
};

/**
 * make sure to pass in a ref, as it's required inside
 */
export const Camera = forwardRef<ExpoCamera, CameraProps>(
  (
    {
      onBarcodeScanned,
      onTakePhoto,
      shouldShowTakePhotoButton = false,
      shouldAllowCameraToggle = false,
      shouldShowInfoPageIcon = false,
      shouldShowScannerOverlay = false,
    }: CameraProps,
    cameraRef
  ) => {
    const styles = useStyles();

    const isCameraReady = useAppSelector(appSelector.selectIsCameraReady);
    const dispatch = useAppDispatch();

    const [facing, setFacing] = useState<CameraType>("back");

    useEffect(() => {
      return () => {
        dispatch(appAction.SET_IS_CAMERA_READY({ isCameraReady: false }));
      };
    }, []);

    const toggleCameraType = () => {
      setFacing((current) => (current === "back" ? "front" : "back"));
    };

    const doubleTap = Gesture.Tap().numberOfTaps(2).onStart(toggleCameraType);

    return (
      <GestureDetector gesture={doubleTap}>
        <View style={styles.container}>
          {!isCameraReady && <LoadingSpinner size="large" />}
          <ExpoCamera
            ref={cameraRef}
            style={[
              (isIos ? !isCameraReady : !isCameraReady) && {
                display: "none",
              },
              styles.camera,
            ]}
            onCameraReady={() =>
              dispatch(appAction.SET_IS_CAMERA_READY({ isCameraReady: true }))
            }
            facing={facing}
            onBarcodeScanned={onBarcodeScanned}
          >
            {shouldShowInfoPageIcon || shouldAllowCameraToggle ? (
              <View style={styles.cameraFloatersContainer}>
                <View style={styles.buttonsBarContainer}>
                  {shouldShowInfoPageIcon && (
                    <InfoIcon
                      size={32}
                      color="highlight"
                      style={shouldAllowCameraToggle && styles.barButton}
                      onPress={askToOpenInfoPage}
                    />
                  )}
                  {shouldAllowCameraToggle && (
                    <CameraSwitchIcon
                      size={32}
                      color="highlight"
                      onPress={toggleCameraType}
                    />
                  )}
                </View>
                {shouldShowScannerOverlay && (
                  <Image
                    style={styles.overlay}
                    source={require("../assets/images/barcode-scanner-overlay.png")}
                  />
                )}
              </View>
            ) : (
              <></>
            )}
            {shouldShowTakePhotoButton && (
              <TouchableOpacity
                onPress={onTakePhoto}
                style={styles.takePhotoButton}
              />
            )}
          </ExpoCamera>
        </View>
      </GestureDetector>
    );
  }
);

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
    infoIconContainer: {
      position: "absolute",
      top: 96,
      right: 32,
      backgroundColor: "transparent",
    },
    buttonsBarContainer: {
      position: "absolute",
      top: theme.spacing * 4,
      right: theme.spacing * 2,
      width: theme.spacing * 8,
      paddingVertical: theme.spacing * 2,
      borderRadius: theme.borderRadiusFull,
      flexGrow: 1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    barButton: { marginBottom: theme.spacing * 2 },
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
    takePhotoButton: {
      position: "absolute",
      bottom: 32,
      left: "50%",
      marginLeft: -35,
      width: 70,
      height: 70,
      borderRadius: 50,
      borderWidth: 5,
      borderColor: "#fff",
    },
  })
);
