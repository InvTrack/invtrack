import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
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
export const Header = ({}: NativeStackHeaderProps) => {
  const router = useRouter();

  return (
    <HeaderWrapper>
      {router.canGoBack() ? (
        <ArrowRightIcon
          size={32}
          onPress={router.canGoBack() ? router.back : () => {}}
        />
      ) : (
        <View />
      )}
      <HeaderRight href="/account" />
    </HeaderWrapper>
  );
};
