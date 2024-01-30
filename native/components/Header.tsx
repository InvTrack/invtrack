import { useNavigation } from "@react-navigation/native";

import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderRight } from "./HeaderRight";
import { ArrowRightIcon } from "./Icon";

const HeaderWrapper = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: "#EDF6FF",
        height: insets.top + 56,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: insets.left + 24,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#C9E0F6",
      }}
    >
      {children}
    </View>
  );
};
export const Header = ({ route }: NativeStackHeaderProps) => {
  const navigation = useNavigation<NativeStackHeaderProps["navigation"]>();
  return (
    <HeaderWrapper>
      {navigation.canGoBack() ? (
        <ArrowRightIcon size={32} onPress={navigation.goBack} />
      ) : (
        <View />
      )}
      {route.name === "SettingsScreen" ? <View /> : <HeaderRight />}
    </HeaderWrapper>
  );
};
