import { EventArg, useNavigation } from "@react-navigation/native";
import React from "react";
// per https://reactnavigation.org/docs/use-focus-effect/
export const useRunBlurEffect = (
  effect: (e: EventArg<"blur", false, undefined>) => void
) => {
  const navigation = useNavigation();
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("blur", (e) => {
      effect(e);
    });

    return unsubscribe;
  }, [navigation, effect]);
};
