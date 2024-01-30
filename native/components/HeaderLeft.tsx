import { useNavigation } from "@react-navigation/native";
import React from "react";
import { HomeIcon } from "./Icon";
export const HeaderLeft = () => {
  const navigation = useNavigation<any>();

  return (
    <HomeIcon
      size={32}
      onPress={() => {
        navigation.navigate("ListTab");
      }}
    />
  );
};
