import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../db";
import { HeaderLeft } from "./HeaderLeft";
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
  const sessionState = useSession();
  const loggedIn = sessionState.loggedIn;
  const router = useRouter();

  if (
    route.name === "account" ||
    route.name === "login" ||
    route.name === "register"
  ) {
    return (
      <HeaderWrapper>
        <ArrowRightIcon size={32} onPress={router.back} />
      </HeaderWrapper>
    );
  }

  return (
    <HeaderWrapper>
      <HeaderLeft
        href={
          loggedIn ? ("/(tabs)/list" as const) : ("/(start)/start" as const)
        }
      />
      <HeaderRight href="/account" />
    </HeaderWrapper>
  );
};
