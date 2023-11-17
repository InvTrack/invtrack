import { BarCodeScanningResult, Camera, CameraType } from "expo-camera";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { CameraSwitchIcon } from "../components/Icon";
import { Typography } from "../components/Typography";
import { createStyles } from "../theme/useStyles";

// TODO Landing page
const handleBarCodeScan = ({ data }: BarCodeScanningResult) => {
  console.log(data);
};
export default function Landing() {
  const styles = useStyles();

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={styles.container}
      >
        <Typography
          variant="l"
          color="darkBlue"
          style={{ textAlign: "center" }}
        >
          Aby skorzystać ze skanera kodów, pozwól aplikacji na dostęp do kamery.
        </Typography>
        <Button
          onPress={requestPermission}
          size="l"
          type="primary"
          shadow
          containerStyle={{ marginTop: 16, width: 200, alignSelf: "center" }}
        >
          Zapytaj o dostęp
        </Button>
      </SafeAreaView>
    );
  }

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <TapGestureHandler
        onHandlerStateChange={toggleCameraType}
        numberOfTaps={2}
      >
        <Camera
          style={styles.camera}
          type={type}
          onBarCodeScanned={handleBarCodeScan}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
              <CameraSwitchIcon size={32} color="mediumBlue" />
            </TouchableOpacity>
          </View>
        </Camera>
      </TapGestureHandler>
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.colors.lightBlue,
      height: "100%",
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      marginTop: 32,
      marginRight: 16,
      justifyContent: "flex-end",
      alignItems: "flex-start",
    },
    button: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
    },
  })
);
