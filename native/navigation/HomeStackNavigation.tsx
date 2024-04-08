import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DocumentScannerContextProvider from "../components/DocumentScanner/DocumentScannerContext";
import { Header } from "../components/Header";
import { isAndroid } from "../constants";
import { BarcodeModalScreen } from "../screens/BarcodeModalScreen";
import { DocumentScannerModalScreen } from "../screens/DocumentScannerModalScreen";
import { IdentifyAliasesScreen } from "../screens/IdentifyAliasesScreen";
import { NewBarcodeScreen } from "../screens/NewBarcodeScreen";
import { NewStockScreen } from "../screens/NewStockScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { BottomTabNavigation } from "./BottomTabNavigation";
import { HomeStackParamList } from "./types";

const Stack = createNativeStackNavigator<HomeStackParamList>();
export const HomeStackNavigation = () => {
  return (
    <DocumentScannerContextProvider>
      <Stack.Navigator
        initialRouteName={"Tabs"}
        screenOptions={{ header: Header }}
      >
        <Stack.Screen name={"Tabs"} component={BottomTabNavigation} />
        <Stack.Screen
          name={"BarcodeModal"}
          component={BarcodeModalScreen}
          options={{
            // in @react-navigation/native-stack on android,
            // modals are not implemented yet (lol),
            // despite the docs stating otherwise. haiku:
            // Native stack on 'id,
            // Modals yet to be deployed,
            // Docs, truth they avoid.
            // https://github.com/software-mansion/react-native-screens/issues/1650
            presentation: isAndroid ? "card" : "modal",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name={"DocumentScannerModal"}
          component={DocumentScannerModalScreen}
          options={{
            // in @react-navigation/native-stack on android,
            // modals are not implemented yet (lol),
            // despite the docs stating otherwise. haiku:
            // Native stack on 'id,
            // Modals yet to be deployed,
            // Docs, truth they avoid.
            // https://github.com/software-mansion/react-native-screens/issues/1650
            presentation: isAndroid ? "card" : "modal",
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
      </Stack.Navigator>
    </DocumentScannerContextProvider>
  );
};
