import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { View } from "react-native";
import { DeliveryFormContextProvider } from "../components/DeliveryFormContext/DeliveryFormContextProvider";
import { DeliveryIcon, InventoryIcon, ListIcon } from "../components/Icon";
import { InventoryFormContextProvider } from "../components/InventoryFormContext/InventoryFormContextProvider";

import { CleanTabBar } from "../components/TabBar";
import { Typography } from "../components/Typography";
import { useListInventories } from "../db";
import { useGetInventoryName } from "../db/hooks/useGetInventoryName";
import DeliveryTabScreen from "../screens/DeliveryTabScreen";
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

  const deliveryId = (routeDeliveryId ?? latestDeliveryId) as number;

  const { data: deliveryName } = useGetInventoryName(deliveryId);

  const noInventories = !data?.length;
  if (noInventories) return <Typography>Brak dostaw</Typography>;
  // TODO skeletons or ???
  if (!(routeDeliveryId ?? deliveryId))
    return <Typography>Brak dostaw</Typography>;

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
            headerTitle: deliveryName,
            headerTitleStyle: {
              color: theme.colors.highlight,
            },
            headerBackVisible: false,
          }}
        />
        <DeliveryStack.Screen
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
            headerTitle: deliveryName,
            headerTitleStyle: {
              color: theme.colors.highlight,
            },
            headerBackVisible: false,
            // headerShown: false,
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

  const { data: inventoryName } = useGetInventoryName(inventoryId);
  const noInventories = !data?.length;

  if (noInventories) return <Typography>Brak inwentaryzacji</Typography>;
  // TODO skeletons or ???
  if (!inventoryId) return <Typography>Brak inwentaryzacji</Typography>;

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
            headerTitle: inventoryName,
            headerTitleStyle: {
              color: theme.colors.highlight,
            },
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
            headerTitle: inventoryName,
            headerTitleStyle: {
              color: theme.colors.highlight,
            },
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
