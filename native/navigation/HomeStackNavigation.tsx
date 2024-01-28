import { createStackNavigator } from "@react-navigation/stack";
import { Header } from "../components/Header";
import { BarcodeModalScreen } from "../screens/BarcodeModalScreen";
import { NewBarcodeScreen } from "../screens/NewBarcodeScreen";
import { NewStockScreen } from "../screens/NewStockScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { BottomTabNavigation } from "./BottomTabNavigation";

const Stack = createStackNavigator();
export const HomeStackNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={"Tabs"}
      screenOptions={{ header: Header }}
    >
      <Stack.Screen name={"Tabs"} component={BottomTabNavigation} />
      <Stack.Screen
        name={"BarcodeModal"}
        component={BarcodeModalScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="NewBarcode" component={NewBarcodeScreen} />
      <Stack.Screen name="NewStockScreen" component={NewStockScreen} />
    </Stack.Navigator>
  );
};
