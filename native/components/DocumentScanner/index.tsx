import { Camera, CameraType, ImageType } from "expo-camera";

import React, { useContext, useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { LoadingSpinner } from "../LoadingSpinner";
import { DocumentScannerContext } from "./DocumentScannerContext";
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
  const {
    dispatch,
    state: { isPreviewShown, isCameraReady, isProcessingPhotoData, ratio },
  } = useContext(DocumentScannerContext);

  useEffect(() => {
    if (!isCameraReady) {
      return;
    }

    const getCameraRatio = async () => {
      if (!cameraRef?.current) {
        return;
      }
      try {
        const ratios = await cameraRef.current?.getSupportedRatiosAsync();
        const ratio = getBestRatio(ratios);
        dispatch({
          type: "SET_RATIO",
          payload: { ratio },
        });
      } catch (error) {
        console.log(error);
      }
    };

    getCameraRatio();
  }, [isCameraReady, cameraRef, dispatch]);

  const takePicture = async () => {
    if (!cameraRef.current || isProcessingPhotoData) return;

    dispatch({ type: "PHOTO_START" });
    const photo = await cameraRef.current.takePictureAsync({
      exif: false,
      base64: true,
      quality: 0.8,
      imageType: ImageType.jpg,
    });
    dispatch({ type: "PHOTO_TAKE", payload: { photo } });
    dispatch({ type: "SWITCH_PREVIEW" });
    dispatch({ type: "PHOTO_END" });
    return;
  };

  return isPreviewShown ? (
    <PhotoPreview />
  ) : (
    <>
      {!isCameraReady && <LoadingSpinner size="large" />}
      <Camera
        ref={cameraRef}
        style={[!isCameraReady && { display: "none" }, styles.camera]}
        type={CameraType.back}
        ratio={ratio}
        onCameraReady={() => dispatch({ type: "CAMERA_READY" })}
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
