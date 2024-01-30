import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Header } from "../components/Header";
import { BarcodeModalScreen } from "../screens/BarcodeModalScreen";
import { NewBarcodeScreen } from "../screens/NewBarcodeScreen";
import { NewStockScreen } from "../screens/NewStockScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { BottomTabNavigation } from "./BottomTabNavigation";
import { HomeStackParamList } from "./types";

const Stack = createNativeStackNavigator<HomeStackParamList>();
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
      <Stack.Screen name="NewBarcodeScreen" component={NewBarcodeScreen} />
      <Stack.Screen name="NewStockScreen" component={NewStockScreen} />
    </Stack.Navigator>
  );
};
