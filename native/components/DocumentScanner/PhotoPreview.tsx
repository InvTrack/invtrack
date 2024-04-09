import { useNetInfo } from "@react-native-community/netinfo";
import { useContext } from "react";
import { ImageBackground } from "react-native";
import { useProcessInvoice } from "../../db/hooks/useProcessInvoice";
import { Button } from "../Button";
import { LoadingSpinner } from "../LoadingSpinner";
import { DocumentScannerContext } from "./DocumentScannerContext";

export const PhotoPreview = () => {
  const { isConnected } = useNetInfo();
  const {
    dispatch,
    state: { photo, inventory_id },
  } = useContext(DocumentScannerContext);

  const { mutate, isLoading, data: _data } = useProcessInvoice();

  return (
    <ImageBackground
      source={{ uri: photo?.uri }}
      style={[
        {
          width: "100%",
          height: "100%",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
        },
        { opacity: isLoading ? 0.7 : 1 },
      ]}
    >
      {isLoading ? (
        <LoadingSpinner size={"large"} />
      ) : (
        <>
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
            Wróć
          </Button>
          <Button
            disabled={!isConnected}
            isLoading={isLoading}
            onPress={
              isLoading
                ? () => null
                : () => {
                    mutate({ inventory_id, base64Photo: photo?.base64! });
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
            Wyślij
          </Button>
        </>
      )}
    </ImageBackground>
  );
};
