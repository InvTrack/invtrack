import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { CogIcon } from "./Icon";

export const HeaderRight = (props: any) => {
  const navigation = useNavigation();
  return (
    <CogIcon size={32} onPress={() => navigation.navigate("SettingsScreen")} />
  );
};
