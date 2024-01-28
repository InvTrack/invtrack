// RNGH has to be on top
// organize-imports-ignore
import "react-native-gesture-handler";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NavigationContainer,
  ThemeProvider,
  useNavigationState,
} from "@react-navigation/native";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, focusManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import React, { useEffect } from "react";
import {
  AppStateStatus,
  Platform,
  StatusBar,
  useColorScheme,
} from "react-native";

import { SessionContext, useSession } from "../db";
import { mainTheme } from "../theme";
import * as ScreenOrientation from "expo-screen-orientation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BottomSheet, BottomSheetProvider } from "../components/BottomSheet";
import RootNavigation from "../navigation/RootNavigation";
import { useFonts } from "expo-font";

ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
// SplashScreen.preventAutoHideAsync();

const ONE_SECOND = 1000;
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      cacheTime: ONE_SECOND * 60 * 5,
      retry: 100,
      retryDelay: (attemptIndex) =>
        Math.min(ONE_SECOND * 2 ** attemptIndex, 30 * ONE_SECOND),
    },
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: 100,
      retryDelay: (attemptIndex) =>
        Math.min(ONE_SECOND * 2 ** attemptIndex, 30 * ONE_SECOND),
      cacheTime: ONE_SECOND * 60 * 5,
      staleTime: ONE_SECOND * 60,
    },
  },
});

const asyncPersist = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
});

const onAppStateChange = (status: AppStateStatus) => {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
};

const ProvideProviders = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const sessionState = useSession();
  const [fontsLoaded, fontsError] = useFonts({
    latoBold: require("../assets/fonts/Lato-Bold.ttf"),
    latoRegular: require("../assets/fonts/Lato-Regular.ttf"),
  });
  const navigationStateKey = useNavigationState((state) => state?.key);

  React.useEffect(() => {
    if (!navigationStateKey) {
      // Temporary fix for router not being ready.
      return;
    }
  }, [navigationStateKey]);

  // useEffect(() => {
  //   if (fontsError) throw fontsError;
  // }, [fontsError]);

  React.useEffect(() => {
    StatusBar.setBarStyle("dark-content", true);
  }, []);

  if (!fontsLoaded || sessionState.loading) {
    // SplashScreen.preventAutoHideAsync();
    return null;
  }
  // else {
  // SplashScreen.hideAsync();
  // }
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
              onSuccess={() =>
                queryClient
                  .resumePausedMutations()
                  .then(() => queryClient.refetchQueries())
              }
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
        <RootNavigation />
        <BottomSheet />
      </ProvideProviders>
    </NavigationContainer>
  );
}
