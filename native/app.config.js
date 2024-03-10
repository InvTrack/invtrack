/**
 * don't import directly, use expo-constants
 */
const config = () => ({
  expo: {
    name: "InvTrack",
    slug: "invtrack",
    version: "1.2.0",
    orientation: "portrait",
    owner: "invtrack",
    icon: "./assets/images/icon.png",
    scheme: "invtrack",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#212939",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      buildNumber: "1.2.0",
      supportsTablet: false,
      bundleIdentifier: "app.invtrack.invtrack",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#212939",
      },
      package: "app.invtrack.invtrack",
      versionCode: 10200,
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Pozwól $(PRODUCT_NAME) na dostęp do kamery.",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "07cea1ba-c2e4-420b-ac38-664a39522dcb",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/07cea1ba-c2e4-420b-ac38-664a39522dcb",
    },
  },
});

export default config;
