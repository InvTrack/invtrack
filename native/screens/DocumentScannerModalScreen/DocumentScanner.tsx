import { CameraView as ExpoCamera } from "expo-camera";

import React, { useRef } from "react";
import { Camera } from "../../components/Camera";
import { useDocumentScannerContext } from "./DocumentScannerContext";
import { PhotoPreview } from "./PhotoPreview";

export const DocumentScanner = ({
  stockId,
  stockType,
}: {
  stockId: number;
  stockType: "delivery" | "inventory";
}) => {
  const cameraRef = useRef<ExpoCamera>(null);

  const { documentScannerState, setDocumentScannerState } =
    useDocumentScannerContext();
  const { isPreviewShown, isTakingPhoto } = documentScannerState;

  const takePicture = async () => {
    if (!cameraRef.current || isTakingPhoto) return;

    setDocumentScannerState((s) => ({
      ...s,
      isTakingPhoto: true,
    }));
    const photo = await cameraRef.current.takePictureAsync({
      exif: false,
      base64: true,
      quality: 0.6,
      imageType: "jpg",
    });
    setDocumentScannerState((s) => ({
      ...s,
      photo: photo || null,
      isPreviewShown: !s.isPreviewShown,
      isTakingPhoto: false,
    }));
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
