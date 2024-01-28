import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import StartScreen from "../screens/StartScreen";

const Stack = createStackNavigator();

export const LoginStackNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={"Start"}>
      <Stack.Screen
        name={"Login"}
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={"Start"}
        component={StartScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
