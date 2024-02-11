import { useNavigation, useTheme } from "@react-navigation/native";

import { NativeStackHeaderProps } from "@react-navigation/native-stack";

import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderRight } from "./HeaderRight";
import { ArrowRightIcon, PlusIcon } from "./Icon";

const HeaderWrapper = ({
  children,
  omitInsets,
}: {
  children: React.ReactNode;
  omitInsets?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const HEADER_HEIGHT = omitInsets ? 56 : insets.top + 56;
  return (
    <View
      style={{
        backgroundColor: theme.colors.mediumBlue,
        height: HEADER_HEIGHT,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: insets.left + 24,
        paddingBottom: HEADER_HEIGHT / 6,
      }}
    >
      {children}
    </View>
  );
};
export const Header = ({ route }: NativeStackHeaderProps) => {
  const navigation = useNavigation<NativeStackHeaderProps["navigation"]>();

  if (route.name === "BarcodeModal") {
    return (
      <HeaderWrapper omitInsets>
        <View />
        <PlusIcon
          onPress={navigation.goBack}
          color="darkGrey"
          size={36}
          style={{
            transform: [{ rotate: "45deg" }],
          }}
        />
      </HeaderWrapper>
    );
  }
  return (
    <HeaderWrapper>
      {navigation.canGoBack() ? (
        <ArrowRightIcon
          size={32}
          onPress={navigation.goBack}
          color="darkGrey"
        />
      ) : (
        <View />
      )}
      {route.name === "SettingsScreen" ? <View /> : <HeaderRight />}
    </HeaderWrapper>
  );
};
