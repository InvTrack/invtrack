import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
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

const noBackButton = () => null;

const Tab = createBottomTabNavigator();
const DeliveryStack = createStackNavigator();
const InventoryStack = createStackNavigator();

const DeliveryStackNavigator = ({ route }) => {
  const theme = useTheme();
  const routeDeliveryId = route.params?.id;

  const { data } = useListInventories();
  const latestDeliveryId = data?.find((item) => item.is_delivery)?.id;

  const deliveryId = routeDeliveryId ?? latestDeliveryId;

  const { data: deliveryName } = useGetInventoryName(deliveryId);
  const noInventories = !data?.length;

  if (noInventories) return <Typography>Brak dostaw</Typography>;
  // TODO skeletons or ???
  if (!(routeDeliveryId ?? deliveryId))
    return <Typography>Brak dostaw</Typography>;

  return (
    <DeliveryFormContextProvider>
      <DeliveryStack.Navigator
        screenOptions={{
          headerBackground: () => (
            <View
              style={{
                backgroundColor: theme.colors.mediumBlue,
                width: "100%",
                height: "100%",
              }}
            />
          ),
          headerTitle: deliveryName,
          headerLeft: noBackButton,
        }}
      >
        <DeliveryStack.Screen
          name="DeliveryTabScreen"
          component={DeliveryTabScreen}
          initialParams={{ id: deliveryId }}
          options={{
            headerShown: false,
          }}
        />
        <DeliveryStack.Screen name="Record" component={RecordScreen} />
      </DeliveryStack.Navigator>
    </DeliveryFormContextProvider>
  );
};

const InventoryStackNavigator = ({ route }) => {
  const theme = useTheme();
  const { data } = useListInventories();

  const routeInventoryId = route.params?.id;
  const lastestInventoryId = data?.find((item) => !item.is_delivery)?.id;

  const inventoryId = routeInventoryId ?? lastestInventoryId;

  const { data: inventoryName } = useGetInventoryName(inventoryId);
  const noInventories = !data?.length;

  if (noInventories) return <Typography>Brak inwentaryzacji</Typography>;
  // TODO skeletons or ???
  if (!inventoryId) return <Typography>Brak inwentaryzacji</Typography>;

  return (
    <InventoryFormContextProvider>
      <InventoryStack.Navigator
        screenOptions={{
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
          headerLeft: noBackButton,
        }}
      >
        <InventoryStack.Screen
          name="InventoryTabScreen"
          component={InventoryTabScreen}
          initialParams={{ id: inventoryId }}
        />
        <InventoryStack.Screen name="Record" component={RecordScreen} />
      </InventoryStack.Navigator>
    </InventoryFormContextProvider>
  );
};

export const BottomTabNavigation = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator initialRouteName="ListTab">
      <Tab.Screen
        name="List"
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
