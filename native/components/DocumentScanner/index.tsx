import { Camera, CameraType, ImageType } from "expo-camera";

import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createStyles } from "../../theme/useStyles";
import { LoadingSpinner } from "../LoadingSpinner";
import { PhotoPreview } from "./PhotoPreview";

const getBestRatio = (ratios: string[]) => {
  if (ratios.includes("16:9")) return "16:9";

  const mRatios = ratios.map((ratio) => {
    const [width, height] = ratio.split(":").map((n) => parseInt(n));
    return width / height;
  });
  const maxRatio = Math.max(...mRatios);
  const index = mRatios.indexOf(maxRatio);
  return ratios[index];
};

export const DocumentScanner = () => {
  const styles = useStyles();
  const cameraRef = useRef<Camera>(null);

  const isPreviewShown = useAppSelector(
    documentScannerSelector.selectIsPreviewShown
  );
  const isCameraReady = useAppSelector(
    documentScannerSelector.selectIsCameraReady
  );
  const isProcessingPhotoData = useAppSelector(
    documentScannerSelector.selectIsProcessingPhotoData
  );
  const ratio = useAppSelector(documentScannerSelector.selectRatio);

  const dispatch = useAppDispatch();

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
        const ratio = getBestRatio(ratios);
        dispatch(documentScannerAction.SET_RATIO({ ratio }));
      } catch (error) {
        console.log(error);
      }
    };

    getCameraRatio();
  }, [isCameraReady, cameraRef, dispatch]);

  const takePicture = async () => {
    if (!cameraRef.current || isProcessingPhotoData) return;

    dispatch(documentScannerAction.PHOTO_START());
    const photo = await cameraRef.current.takePictureAsync({
      exif: false,
      base64: true,
      quality: 0.8,
      imageType: ImageType.jpg,
    });
    dispatch(documentScannerAction.PHOTO_TAKE({ photo }));
    dispatch(documentScannerAction.SWITCH_PREVIEW());
    dispatch(documentScannerAction.PHOTO_END());
    return;
  };

  return isPreviewShown ? (
    <PhotoPreview />
  ) : (
    <>
      {(!isCameraReady || ratio == null) && <LoadingSpinner size="large" />}
      <Camera
        ref={cameraRef}
        style={[
          (!isCameraReady || ratio == null) && { display: "none" },
          styles.camera,
        ]}
        type={CameraType.back}
        // not displayed if null, as specified above
        ratio={ratio!}
        onCameraReady={() => dispatch(documentScannerAction.CAMERA_READY())}
      >
        <TouchableOpacity
          onPress={takePicture}
          style={{
            alignSelf: "center",
            width: 70,
            height: 70,
            marginBottom: 32,
            borderRadius: 50,
            borderWidth: 5,
            borderColor: "#fff",
          }}
        />
      </Camera>
    </>
  );
};

const useStyles = createStyles(() =>
  StyleSheet.create({
    camera: {
      flex: 1,
      justifyContent: "flex-end",
    },
  })
);
