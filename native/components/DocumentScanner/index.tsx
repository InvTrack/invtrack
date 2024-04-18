import { Camera, CameraType, ImageType } from "expo-camera";

import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { appAction, appSelector } from "../../redux/appSlice";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { createStyles } from "../../theme/useStyles";
import { getBestCameraRatio } from "../../utils";
import { LoadingSpinner } from "../LoadingSpinner";
import { PhotoPreview } from "./PhotoPreview";

export const DocumentScanner = () => {
  const styles = useStyles();
  const cameraRef = useRef<Camera>(null);

  const isPreviewShown = useAppSelector(
    documentScannerSelector.selectIsPreviewShown
  );
  const isCameraReady = useAppSelector(appSelector.selectIsCameraReady);
  const isProcessingPhotoData = useAppSelector(
    documentScannerSelector.selectIsProcessingPhotoData
  );
  const ratio = useAppSelector(appSelector.selectCameraRatio);

  const dispatch = useAppDispatch();

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
        onCameraReady={() =>
          dispatch(appAction.SET_IS_CAMERA_READY({ isCameraReady: true }))
        }
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
