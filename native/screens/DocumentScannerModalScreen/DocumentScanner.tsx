import { CameraView as ExpoCamera } from "expo-camera";

import React, { useRef } from "react";
import { Camera } from "../../components/Camera";
import { useDocumentScannerContext } from "./DocumentScannerContext";
import { PhotoPreview } from "./PhotoPreview";

export const DocumentScanner = ({
  stockId,
  stockType,
}: {
  isScanningSalesRaport: boolean;
  stockId: number;
  stockType: "delivery" | "inventory";
}) => {
  const cameraRef = useRef<ExpoCamera>(null);

  const { documentScannerState, updateDocumentScannerState } =
    useDocumentScannerContext();
  const { isPreviewShown, isTakingPhoto } = documentScannerState;

  const takePicture = async () => {
    if (!cameraRef.current || isTakingPhoto) return;

    updateDocumentScannerState((d) => {
      d.isTakingPhoto = true;
    });
    const photo = await cameraRef.current.takePictureAsync({
      exif: false,
      base64: true,
      quality: 0.6,
      imageType: "jpg",
    });
    updateDocumentScannerState((d) => {
      d.photo = photo || null;
      d.isPreviewShown = !d.isPreviewShown;
      d.isTakingPhoto = false;
    });
    // dispatch(documentScannerAction.PHOTO_TAKE({ photo }));
    // dispatch(documentScannerAction.SWITCH_PREVIEW());
    // dispatch(documentScannerAction.PHOTO_END());
    return;
  };

  if (isPreviewShown) {
    return <PhotoPreview stockId={stockId} stockType={stockType} />;
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
