import { onlineManager } from "@tanstack/react-query";
import React from "react";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export function useOnlineManager() {
  React.useEffect(() => {
    if (Platform.OS !== "web") {
      return NetInfo.addEventListener((state) => {
        const status =
          state.isConnected != null &&
          state.isConnected &&
          Boolean(state.isInternetReachable);
        onlineManager.setOnline(status);
      });
    }
  }, []);
}
