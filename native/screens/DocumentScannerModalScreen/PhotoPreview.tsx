import { useNetInfo } from "@react-native-community/netinfo";
import { ImageBackground } from "react-native";
import { Button } from "../../components/common/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useDocumentScannerContext } from "./DocumentScannerContext";
import { useProcessDocument } from "./useProcessDocument";

export const PhotoPreview = ({
  stockId,
  stockType,
}: {
  stockId: number;
  stockType: "delivery" | "inventory";
}) => {
  const { isConnected } = useNetInfo();

  const { documentScannerState, setDocumentScannerState } =
    useDocumentScannerContext();

  const photo = documentScannerState.photo;

  const {
    mutate,
    isLoading,
    data: _data,
  } = useProcessDocument(stockId, stockType);

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
              isLoading
                ? () => null
                : () =>
                    setDocumentScannerState((s) => ({
                      ...s,
                      photo: null,
                      isPreviewShown: false,
                    }))
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
                    mutate({
                      base64Photo: photo?.base64!,
                    });
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
