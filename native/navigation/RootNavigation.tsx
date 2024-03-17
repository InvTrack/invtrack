import { useNetInfo } from "@react-native-community/netinfo";
import { useUpdates } from "expo-updates";
import React from "react";
import { useSession } from "../db";
import { useCheckIfNativeUpdateNeeded } from "../db/hooks/useCheckIfNativeUpdateNeeded";
import { HomeStackNavigation } from "./HomeStackNavigation";
import { LoginStackNavigation } from "./LoginStackNavigation";
import { UpdateRequiredNavigation } from "./UpdateRequiredNavigation";

const RootNavigation = () => {
  const sessionState = useSession();
  const netInfo = useNetInfo();
  const { data: isNativeUpdateNeeded } = useCheckIfNativeUpdateNeeded();
  const { isUpdatePending, isUpdateAvailable } = useUpdates();

  const isUpdateRequired =
    isUpdatePending || isUpdateAvailable || isNativeUpdateNeeded;

  const isLoggedIn = sessionState.loggedIn;

  if (netInfo.isConnected && isUpdateRequired) {
    return <UpdateRequiredNavigation />;
  }

  if (isLoggedIn) {
    return <HomeStackNavigation />;
  }

  return <LoginStackNavigation />;
};

export default RootNavigation;
