import { useNavigation } from "@react-navigation/native";
import React from "react";
import { HomeIcon } from "./Icon";
// interface HeaderLeft<T> extends HeaderButtonProps {
//   href: Href<T>;
// }
export const HeaderLeft = <T,>(
  props: any //  HeaderLeft<T>
) => {
  const navigation = useNavigation();

  return (
    <HomeIcon
      size={32}
      onPress={() => {
        navigation.navigate("ListTab");
      }}
    />
  );
};
