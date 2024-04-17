import { Camera as ExpoCamera, ImageType } from "expo-camera";

import React, { useEffect, useRef } from "react";
import { appAction, appSelector } from "../../redux/appSlice";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { getBestCameraRatio } from "../../utils";
import { Camera } from "../Camera";
import { PhotoPreview } from "./PhotoPreview";

export const DocumentScanner = () => {
  const cameraRef = useRef<ExpoCamera>(null);

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
    <Camera
      ref={cameraRef}
      onTakePhoto={takePicture}
      shouldShowTakePhotoButton
      shouldShowInfoPageIcon
    />
  );
};
