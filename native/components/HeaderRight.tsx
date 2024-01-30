import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { CogIcon } from "./Icon";

export const HeaderRight = () => {
  const navigation = useNavigation<any>();
  return (
    <CogIcon size={32} onPress={() => navigation.navigate("SettingsScreen")} />
  );
};
