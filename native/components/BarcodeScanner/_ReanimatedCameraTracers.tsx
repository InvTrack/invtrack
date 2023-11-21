import { BarCodeScanningResult, Camera, CameraType, Point } from "expo-camera";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { createStyles } from "../../theme/useStyles";
import { useDimensions } from "../../utils/useDimensions";
import { Button } from "../Button";
import { CameraSwitchIcon } from "../Icon";
import { Typography } from "../Typography";
// this crashes the app with no error message
const TRACER_SIZE = 10;
const TOP_BAR_HEIGHT = 56;
export default function Landing() {
  const styles = useStyles();
  const [type, setType] = useState(CameraType.back);

  const [corner1, setCorner1] = useState({ x: 0, y: 0 });
  const [corner2, setCorner2] = useState({ x: 0, y: 0 });
  const [corner3, setCorner3] = useState({ x: 0, y: 0 });
  const [corner4, setCorner4] = useState({ x: 0, y: 0 });

  const animatedCorner1X = useSharedValue(corner1.x);
  const animatedCorner1Y = useSharedValue(corner1.y);
  const animatedCorner2X = useSharedValue(corner2.x);
  const animatedCorner2Y = useSharedValue(corner2.y);
  const animatedCorner3X = useSharedValue(corner3.x);
  const animatedCorner3Y = useSharedValue(corner3.y);
  const animatedCorner4X = useSharedValue(corner4.x);
  const animatedCorner4Y = useSharedValue(corner4.y);

  const { width, height } = useDimensions();
  const { top: topInset } = useSafeAreaInsets();

  const interpolateXAnim = (x: Animated.SharedValue<number>) =>
    interpolate(
      x.value,
      [0, 1],
      [0, height - 2 * TRACER_SIZE - TOP_BAR_HEIGHT - topInset]
    );

  const interpolateYAnim = (y: Animated.SharedValue<number>) =>
    interpolate(y.value, [0, 1], [width - TRACER_SIZE, 0]);

  const corner1Styles = useAnimatedStyle(() => ({
    top: interpolateXAnim(animatedCorner1X) - TRACER_SIZE,
    left: interpolateYAnim(animatedCorner1Y),
  }));
  const corner2Styles = useAnimatedStyle(() => ({
    top: interpolateXAnim(animatedCorner2X) + TRACER_SIZE,
    left: interpolateYAnim(animatedCorner2Y),
  }));
  const corner3Styles = useAnimatedStyle(() => ({
    top: interpolateXAnim(animatedCorner3X) + TRACER_SIZE,
    left: interpolateYAnim(animatedCorner3Y),
  }));
  const corner4Styles = useAnimatedStyle(() => ({
    top: interpolateXAnim(animatedCorner4X) - TRACER_SIZE,
    left: interpolateYAnim(animatedCorner4Y),
  }));
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

  const setCorners = (corners: Point[]) => {
    animatedCorner1X.value = withTiming(corners[0].x);
    animatedCorner1Y.value = withTiming(corners[0].y);
    animatedCorner2X.value = withTiming(corners[1].x);
    animatedCorner2Y.value = withTiming(corners[1].y);
    animatedCorner3X.value = withTiming(corners[2].x);
    animatedCorner3Y.value = withTiming(corners[2].y);
    animatedCorner4X.value = withTiming(corners[3].x);
    animatedCorner4Y.value = withTiming(corners[3].y);

    if (corner1.x === 0 && corner1.y === 0) {
      setCorner1(corners[0]);
      setCorner2(corners[1]);
      setCorner3(corners[2]);
      setCorner4(corners[3]);
    }
  };
  const handleBarCodeScan = (event: BarCodeScanningResult) => {
    const { cornerPoints } = event;
    setCorners(cornerPoints);
    console.log(
      cornerPoints,
      "interpolated",
      corner1,
      corner2,
      corner3,
      corner4
    );
  };

  const RenderOutline = () => (
    <View style={[styles.outlineContainer]}>
      {/* top left */}
      <Animated.View style={[styles.outlinePoint, corner1Styles]} />
      {/* bottom left */}
      <Animated.View style={[styles.outlinePoint, corner2Styles]} />
      {/* bottom right */}
      <Animated.View style={[styles.outlinePoint, corner3Styles]} />
      {/* top right */}
      <Animated.View style={[styles.outlinePoint, corner4Styles]} />
    </View>
  );
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
          {<RenderOutline />}
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
      borderRadius: theme.borderRadiusFull,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
    },
    outlineContainer: {
      position: "absolute",
    },
    outlinePoint: {
      position: "absolute",
      width: TRACER_SIZE,
      height: TRACER_SIZE,
      backgroundColor: "rgba(0, 0, 0,1)",
      justifyContent: "center",
      borderRadius: theme.borderRadiusFull,
    },
  })
);
