import { CameraView as ExpoCamera } from "expo-camera";

import React, { useRef } from "react";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { Camera } from "../Camera";
import { InvoicePhotoPreview } from "./InvoicePhotoPreview";
import { SalesRaportPhotoPreview } from "./SalesRaportPhotoPreview";

export const DocumentScanner = ({
  isScanningSalesRaport,
}: {
  isScanningSalesRaport: boolean;
}) => {
  const cameraRef = useRef<ExpoCamera>(null);

  const isPreviewShown = useAppSelector(
    documentScannerSelector.selectIsPreviewShown
  );
  const isTakingPhoto = useAppSelector(
    documentScannerSelector.selectisTakingPhoto
  );

  const dispatch = useAppDispatch();
  const takePicture = async () => {
    if (!cameraRef.current || isTakingPhoto) return;

    dispatch(documentScannerAction.PHOTO_START());
    const photo = await cameraRef.current.takePictureAsync({
      exif: false,
      base64: true,
      quality: 0.6,
      imageType: "jpg",
    });
    dispatch(documentScannerAction.PHOTO_TAKE({ photo }));
    dispatch(documentScannerAction.SWITCH_PREVIEW());
    dispatch(documentScannerAction.PHOTO_END());
    return;
  };

  if (isPreviewShown && isScanningSalesRaport) {
    return <SalesRaportPhotoPreview />;
  }
  if (isPreviewShown && !isScanningSalesRaport) {
    return <InvoicePhotoPreview />;
  }

  return (
    <Camera
      ref={cameraRef}
      onTakePhoto={takePicture}
      shouldShowTakePhotoButton
      shouldShowInfoPageIcon
    />
  );
};
