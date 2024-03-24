import { Camera, CameraType, ImageType } from "expo-camera";

import React, { useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { LoadingSpinner } from "../LoadingSpinner";
import { DocumentScannerContext } from "./DocumentScannerContext";
import { PhotoPreview } from "./PhotoPreview";

export const DocumentScannerContent = () => {
  const styles = useStyles();
  const cameraRef = useRef<Camera>(null);
  const {
    dispatch,
    state: { isPreviewShown, isCameraReady, isProcessingPhotoData, photo },
  } = useContext(DocumentScannerContext);
  const [is16by9, setIs16by9] = useState(false);

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
        setIs16by9(ratios.includes("16:9"));
      } catch (error) {
        console.log(error);
      }
    };

    getCameraRatio();
  }, [isCameraReady, cameraRef, setIs16by9]);

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
    <PhotoPreview {...photo!} />
  ) : (
    <>
      {/* HACKYYY ! */}
      {!isCameraReady && <LoadingSpinner size="large" />}
      <Camera
        ref={cameraRef}
        style={[!isCameraReady && { display: "none" }, styles.camera]}
        type={CameraType.back}
        ratio={is16by9 ? "16:9" : "4:3"}
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
