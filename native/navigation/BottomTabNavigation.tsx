import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { View } from "react-native";
import { DeliveryFormContextProvider } from "../components/DeliveryFormContext/DeliveryFormContextProvider";
import { DeliveryIcon, InventoryIcon, ListIcon } from "../components/Icon";
import { InventoryFormContextProvider } from "../components/InventoryFormContext/InventoryFormContextProvider";
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
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerBackVisible: false,
            headerTitle: deliveryName,
          }}
        />
        <DeliveryStack.Screen
          name="RecordScreen"
          component={RecordScreen}
          options={{
            headerBackground: () => (
              <View
                style={{
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerBackVisible: false,
            headerTitle: deliveryName,
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
                  backgroundColor: theme.colors.mediumBlue,
                  width: "100%",
                  height: "100%",
                }}
              />
            ),
            headerTitle: inventoryName,
            headerBackVisible: false,
          }}
        />
        <InventoryStack.Screen
          name="RecordScreen"
          component={RecordScreen}
          options={{
            headerShown: false,
          }}
        />
      </InventoryStack.Navigator>
    </InventoryFormContextProvider>
  );
};

export const BottomTabNavigation = ({}: BottomTabProps) => {
  return (
    <Tab.Navigator initialRouteName="ListTab">
      <Tab.Screen
        name="ListTab"
        component={ListTab}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <ListIcon color={focused ? "mediumBlue" : "darkBlue"} size={37} />
          ),
          headerShown: false,
          lazy: false,
        }}
      />
      <Tab.Screen
        name="DeliveryTab"
        component={DeliveryStackNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <InventoryIcon
              color={focused ? "mediumBlue" : "darkBlue"}
              size={37}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="InventoryTab"
        component={InventoryStackNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <DeliveryIcon
              color={focused ? "mediumBlue" : "darkBlue"}
              size={37}
            />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};
