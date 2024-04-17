import { AutoFocus, CameraType, Camera as ExpoCamera } from "expo-camera";

import React, {
  ComponentProps,
  RefObject,
  forwardRef,
  useEffect,
  useState,
} from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { appAction, appSelector } from "../redux/appSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createStyles } from "../theme/useStyles";
import { getBestCameraRatio } from "../utils";
import { CameraSwitchIcon, InfoIcon } from "./Icon";
import { LoadingSpinner } from "./LoadingSpinner";

type CameraProps = {
  onBarCodeScanned?: ComponentProps<typeof ExpoCamera>["onBarCodeScanned"];
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
          Linking.openURL("https://invtrack.app/");
        },
      },
    ]
  );
};

export const Camera = forwardRef<ExpoCamera, CameraProps>(
  (
    {
      onBarCodeScanned,
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
    const ratio = useAppSelector(appSelector.selectCameraRatio);
    const dispatch = useAppDispatch();

    const [type, setType] = useState(CameraType.back);

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
        if (!(cameraRef as RefObject<ExpoCamera>).current) {
          return;
        }
        try {
          const ratios = await (
            cameraRef as RefObject<ExpoCamera>
          ).current?.getSupportedRatiosAsync();
          const ratio = getBestCameraRatio(ratios ?? null);
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

    const composedGestures = shouldAllowCameraToggle
      ? singleTap
      : Gesture.Exclusive(doubleTap, singleTap);

    return (
      <GestureDetector gesture={composedGestures}>
        <View style={styles.container}>
          {(!isCameraReady || ratio == null) && <LoadingSpinner size="large" />}
          <ExpoCamera
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
            onBarCodeScanned={onBarCodeScanned}
          >
            {shouldShowInfoPageIcon || shouldAllowCameraToggle ? (
              <></>
            ) : (
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
