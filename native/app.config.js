/**
 * don't import directly, use expo-constants
 */
const config = {
  expo: {
    name: "InvTrack",
    slug: "invtrack",
    version: "1.0.0",
    orientation: "portrait",
    owner: "invtrack",
    icon: "./assets/images/icon.png",
    scheme: "invtrack",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#C9E0F6",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      buildNumber: "1.0.0",
      supportsTablet: false,
      bundleIdentifier: "app.invtrack.invtrack",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#C9E0F6",
      },
      package: "app.invtrack.invtrack",
      versionCode: 1000,
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Pozwól $(PRODUCT_NAME) na dostęp do kamery.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
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
};

export default config;
