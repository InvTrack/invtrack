import { Camera as ExpoCamera, ImageType } from "expo-camera";

import React, { useRef } from "react";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { Camera } from "../Camera";
import { PhotoPreview } from "./PhotoPreview";

export const DocumentScanner = () => {
  const cameraRef = useRef<ExpoCamera>(null);

  const isPreviewShown = useAppSelector(
    documentScannerSelector.selectIsPreviewShown
  );
  const isProcessingPhotoData = useAppSelector(
    documentScannerSelector.selectIsProcessingPhotoData
  );

  const dispatch = useAppDispatch();
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
