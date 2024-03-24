import { useNetInfo } from "@react-native-community/netinfo";
import { CameraCapturedPicture } from "expo-camera";
import { useContext, useEffect } from "react";
import { ImageBackground } from "react-native";
import { useProcessInvoice } from "../../db/hooks/useProcessInvoice";
import { Button } from "../Button";
import { useSnackbar } from "../Snackbar/context";
import { DocumentScannerContext } from "./DocumentScannerContext";

export const PhotoPreview = ({ base64, uri }: CameraCapturedPicture) => {
  const { isConnected } = useNetInfo();
  const {
    dispatch,
    state: {},
  } = useContext(DocumentScannerContext);
  const { mutate, isLoading, isError } = useProcessInvoice();
  const { showError } = useSnackbar();
  console.log(base64);
  useEffect(() => {
    if (isError) {
      showError("Błąd - nie udało się przetworzyć zdjęcia");
      return;
    }
  }, [isError]);

  return (
    <ImageBackground
      source={{ uri: uri }}
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
      }}
    >
      <Button
        disabled={!isConnected || isLoading}
        onPress={
          isLoading ? () => null : () => dispatch({ type: "PHOTO_RETAKE" })
        }
        size="s"
        type="primary"
        shadow
        containerStyle={{
          width: "40%",
          alignSelf: "flex-end",
          marginBottom: 32,
        }}
      >
        Retake
      </Button>
      <Button
        disabled={!isConnected}
        isLoading={isLoading}
        onPress={
          isLoading
            ? () => null
            : async () => {
                await mutate(base64!);
              }
        }
        size="s"
        type="primary"
        shadow
        containerStyle={{
          width: "40%",
          alignSelf: "flex-end",
          marginBottom: 32,
        }}
      >
        Save
      </Button>
    </ImageBackground>
  );
};
