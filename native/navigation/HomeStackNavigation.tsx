import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Header } from "../components/Header";
import { BarcodeModalScreen } from "../screens/BarcodeModalScreen";
import { DocumentScannerModalScreen } from "../screens/DocumentScannerModalScreen";
import { IdentifyAliasesScreen } from "../screens/IdentifyAliasesScreen";
import { NewBarcodeScreen } from "../screens/NewBarcodeScreen";
import { NewProductScreen } from "../screens/NewProductScreen";
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
        options={{
          presentation: "card",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={"DocumentScannerModal"}
        component={DocumentScannerModalScreen}
        options={{
          presentation: "card",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="IdentifyAliasesScreen"
        component={IdentifyAliasesScreen}
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="NewBarcodeScreen" component={NewBarcodeScreen} />
      <Stack.Screen name="NewStockScreen" component={NewStockScreen} />
      <Stack.Screen name="NewProductScreen" component={NewProductScreen} />
    </Stack.Navigator>
  );
};
