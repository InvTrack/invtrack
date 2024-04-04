import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { View } from "react-native";
import { DeliveryFormContextProvider } from "../components/DeliveryFormContext/DeliveryFormContextProvider";
import { DeliveryIcon, InventoryIcon, ListIcon } from "../components/Icon";
import { InventoryFormContextProvider } from "../components/InventoryFormContext/InventoryFormContextProvider";

import { isEmpty } from "lodash";
import { EmptyScreenTemplate } from "../components/EmptyScreenTemplate";
import { CleanTabBar } from "../components/TabBar";
import { useListInventories } from "../db";

import { AddRecordScreen } from "../screens/AddRecordScreen";
import DeliveryTabScreen from "../screens/DeliveryTabScreen";
import { IdentifyAliasesScreen } from "../screens/IdentifyAliasesScreen";
import InventoryTabScreen from "../screens/InventoryTabScreen";
import { ListTab } from "../screens/ListTabScreen";
import { RecordScreen } from "../screens/RecordScreen";
import {
  BottomTabParamList,
  BottomTabProps,
  DeliveryStackParamList,
  DeliveryTabProps,
  InventoryStackParamList,
  InventoryTabProps,
} from "./types";

const Tab = createBottomTabNavigator<BottomTabParamList>();

const DeliveryStack = createNativeStackNavigator<DeliveryStackParamList>();
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();

const DeliveryStackNavigator = ({ route }: DeliveryTabProps) => {
  const theme = useTheme();
  const routeDeliveryId = route.params?.id;

  const { data } = useListInventories();
  const latestDeliveryId = data?.find((item) => item.is_delivery)?.id;

  const deliveryId = routeDeliveryId ?? latestDeliveryId;

  const noDeliveries = !latestDeliveryId && !isEmpty(data);

  if (noDeliveries)
    return (
      <EmptyScreenTemplate>
        Brak dostaw. Dodaj nową dostawę z ekranu listy!
      </EmptyScreenTemplate>
    );

  if (!deliveryId)
    return (
      <EmptyScreenTemplate>
        Błąd - brak identyfikatora dostawy. Zrestartuj aplikację i spróbuj
        ponownie.
      </EmptyScreenTemplate>
    );

  return (
    <DeliveryFormContextProvider>
      <DeliveryStack.Navigator screenOptions={{ headerShown: true }}>
        <DeliveryStack.Screen
          name="DeliveryTabScreen"
          component={DeliveryTabScreen}
          initialParams={{ id: deliveryId }}
          options={{
            headerBackground: () => (
              <View
                style={{
                  borderColor: theme.colors.darkBlue,
                  borderTopWidth: 2,
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerTitleStyle: {
              color: theme.colors.highlight,
              fontSize: theme.text.xs.fontSize,
              fontFamily: theme.text.xs.fontFamily,
            },
            headerTitleAlign: "center",
            headerBackVisible: false,
          }}
        />
        <DeliveryStack.Screen
          name="RecordScreen"
          component={RecordScreen}
          initialParams={{ isDelivery: true }}
          options={{
            headerBackground: () => (
              <View
                style={{
                  borderColor: theme.colors.darkBlue,
                  borderTopWidth: 2,
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerTitleStyle: {
              color: theme.colors.highlight,
              fontSize: theme.text.xs.fontSize,
              fontFamily: theme.text.xs.fontFamily,
            },
            headerTitleAlign: "center",
            headerBackVisible: false,
          }}
        />
        <DeliveryStack.Screen
          name="AddRecordScreen"
          component={AddRecordScreen}
          options={{
            headerBackground: () => (
              <View
                style={{
                  borderColor: theme.colors.darkBlue,
                  borderTopWidth: 2,
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerTitleStyle: {
              color: theme.colors.highlight,
              fontSize: theme.text.xs.fontSize,
              fontFamily: theme.text.xs.fontFamily,
            },
            headerTitleAlign: "center",
            headerBackVisible: false,
          }}
        />
        <DeliveryStack.Screen
          name="IdentifyAliasesScreen"
          component={IdentifyAliasesScreen}
          options={{
            headerBackground: () => (
              <View
                style={{
                  borderColor: theme.colors.darkBlue,
                  borderTopWidth: 2,
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerTitle: "",
            headerBackVisible: false,
          }}
        />
      </DeliveryStack.Navigator>
    </DeliveryFormContextProvider>
  );
};

const InventoryStackNavigator = ({ route }: InventoryTabProps) => {
  const theme = useTheme();
  const { data } = useListInventories();

  const routeInventoryId = route.params?.id;
  const lastestInventoryId = data?.find((item) => !item.is_delivery)?.id;

  const inventoryId = (routeInventoryId ?? lastestInventoryId) as number;

  const noInventories = !lastestInventoryId && !isEmpty(data);
  if (noInventories)
    return (
      <EmptyScreenTemplate>
        Brak inwentaryzacji. Dodaj nową inwentaryzację z ekranu listy!
      </EmptyScreenTemplate>
    );
  if (!inventoryId)
    return (
      <EmptyScreenTemplate>
        Błąd - brak identyfikatora inwentaryzacji. Zrestartuj aplikację i
        spróbuj ponownie.
      </EmptyScreenTemplate>
    );

  return (
    <InventoryFormContextProvider>
      <InventoryStack.Navigator
        screenOptions={{
          headerShown: true,
        }}
      >
        <InventoryStack.Screen
          name="InventoryTabScreen"
          component={InventoryTabScreen}
          initialParams={{ id: inventoryId }}
          options={{
            headerBackground: () => (
              <View
                style={{
                  borderColor: theme.colors.darkBlue,
                  borderTopWidth: 2,
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerTitleStyle: {
              color: theme.colors.highlight,
              fontSize: theme.text.xs.fontSize,
              fontFamily: theme.text.xs.fontFamily,
            },
            headerTitleAlign: "center",
            headerBackVisible: false,
          }}
        />
        <InventoryStack.Screen
          name="RecordScreen"
          component={RecordScreen}
          options={{
            headerBackground: () => (
              <View
                style={{
                  borderColor: theme.colors.darkBlue,
                  borderTopWidth: 2,
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerTitleStyle: {
              color: theme.colors.highlight,
              fontSize: theme.text.xs.fontSize,
              fontFamily: theme.text.xs.fontFamily,
            },
            headerTitleAlign: "center",
            headerBackVisible: false,
          }}
        />
        <InventoryStack.Screen
          name="AddRecordScreen"
          component={AddRecordScreen}
          options={{
            headerBackground: () => (
              <View
                style={{
                  borderColor: theme.colors.darkBlue,
                  borderTopWidth: 2,
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerTitleStyle: {
              color: theme.colors.highlight,
              fontSize: theme.text.xs.fontSize,
              fontFamily: theme.text.xs.fontFamily,
            },
            headerTitleAlign: "center",
            headerBackVisible: false,
          }}
        />
      </InventoryStack.Navigator>
    </InventoryFormContextProvider>
  );
};

export const BottomTabNavigation = ({}: BottomTabProps) => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="ListTab"
      tabBar={(props) => <CleanTabBar {...props} />}
    >
      <Tab.Screen
        name="ListTab"
        component={ListTab}
        options={{
          title: "Lista",
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.highlight,
          tabBarIcon: () => <ListIcon color="darkGrey" size={37} />,
          headerShown: false,
          lazy: false,
        }}
      />
      <Tab.Screen
        name="InventoryTab"
        component={InventoryStackNavigator}
        options={{
          title: "Inwentaryzacja",
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.highlight,
          tabBarIcon: () => <InventoryIcon color="darkGrey" size={37} />,
          headerShown: false,
          lazy: false,
        }}
      />
      <Tab.Screen
        name="DeliveryTab"
        component={DeliveryStackNavigator}
        options={{
          title: "Dostawa",
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.highlight,
          tabBarIcon: () => <DeliveryIcon color="darkGrey" size={37} />,
          headerShown: false,
          lazy: false,
        }}
      />
    </Tab.Navigator>
  );
};
