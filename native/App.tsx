// RNGH has to be on top
// organize-imports-ignore
import "react-native-gesture-handler";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, ThemeProvider } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  QueryClient,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import React from "react";
import {
  AppStateStatus,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";

import { SessionContext, useSession } from "./db";
import { mainTheme } from "./theme";
import * as ScreenOrientation from "expo-screen-orientation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheet, BottomSheetProvider } from "./components/BottomSheet";
import RootNavigation from "./navigation/RootNavigation";
import { useFonts } from "expo-font";
import { useAppState } from "./utils/useAppState";
import * as SplashScreen from "expo-splash-screen";
import { SnackbarRenderer } from "./components/Snackbar";
import { SnackbarProvider } from "./components/Snackbar/context";

ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
SplashScreen.preventAutoHideAsync();

const ONE_SECOND = 1000;
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      cacheTime: ONE_SECOND * 60 * 5,
      retry: 10,
      retryDelay: (attemptIndex) =>
        Math.min(ONE_SECOND * 2 ** attemptIndex, 30 * ONE_SECOND),
    },
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: 10,
      retryDelay: (attemptIndex) =>
        Math.min(ONE_SECOND * 2 ** attemptIndex, 30 * ONE_SECOND),
      cacheTime: ONE_SECOND * 60 * 10,
      staleTime: ONE_SECOND * 60,
    },
  },
});

const asyncPersist = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "query-cache",
  throttleTime: 500,
});

const onAppStateChange = (status: AppStateStatus) => {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
};

const ProvideProviders = ({ children }: { children: React.ReactNode }) => {
  useAppState(onAppStateChange);

  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });
  });

  const colorScheme = useColorScheme();
  const sessionState = useSession();
  const [fontsLoaded] = useFonts({
    latoBold: require("./assets/fonts/Lato-Bold.ttf"),
    latoRegular: require("./assets/fonts/Lato-Regular.ttf"),
  });

  React.useEffect(() => {
    StatusBar.setBarStyle("light-content", true);
  }, []);

  if (!fontsLoaded || sessionState.loading) {
    SplashScreen.preventAutoHideAsync();
    return null;
  } else {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 200);
  }
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetProvider>
          <SessionContext.Provider value={sessionState}>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{
                persister: asyncPersist,
              }}
            >
              <ThemeProvider
                value={colorScheme === "dark" ? mainTheme : mainTheme}
              >
                {children}
              </ThemeProvider>
            </PersistQueryClientProvider>
          </SessionContext.Provider>
        </BottomSheetProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <ProvideProviders>
        <SnackbarProvider>
          <SnackbarRenderer />
          <RootNavigation />
          <BottomSheet />
        </SnackbarProvider>
      </ProvideProviders>
    </NavigationContainer>
  );
}
