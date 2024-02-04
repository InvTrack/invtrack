import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Header } from "../components/Header";
import LoginScreen from "../screens/LoginScreen";
import StartScreen from "../screens/StartScreen";
import { LoginStackParamList } from "./types";

const Stack = createNativeStackNavigator<LoginStackParamList>();

export const LoginStackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={"StartScreen"}
      screenOptions={{ header: Header }}
    >
      <Stack.Screen name={"LoginScreen"} component={LoginScreen} />
      <Stack.Screen
        name={"StartScreen"}
        component={StartScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
