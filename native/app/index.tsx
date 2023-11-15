import { BarCodeScanningResult, Camera, CameraType } from "expo-camera";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
      <Camera
        style={styles.camera}
        type={type}
        onBarCodeScanned={handleBarCodeScan}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <CameraSwitchIcon size={64} />
          </TouchableOpacity>
        </View>
      </Camera>
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
      flex: 1,
      flexDirection: "row",
      backgroundColor: "transparent",
      marginBottom: 32,
    },
    button: {
      flex: 1,
      alignSelf: "flex-end",
      alignItems: "center",
    },
    text: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
    },
  })
);
