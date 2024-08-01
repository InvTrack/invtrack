import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { View } from "react-native";
import { DeliveryIcon, InventoryIcon, ListIcon } from "../components/Icon";

import { isEmpty } from "lodash";
import { TabBar } from "../components/TabBar";
import { EmptyScreenTemplate } from "../components/common/EmptyScreenTemplate";
import { useListInventories } from "../db";

import { AddRecordScreen } from "../screens/AddRecordScreen";
import { ListTab } from "../screens/ListTabScreen/ListTabScreen";
import { RecordScreen } from "../screens/RecordScreen";
import { StockContextProvider } from "../screens/StockTabScreen/StockContext/StockContextProvider";
import StockTabScreen from "../screens/StockTabScreen/StockTabScreen";
import {
  BottomTabParamList,
  BottomTabProps,
  StockStackParamList,
  StockTabProps,
} from "./types";

const Tab = createBottomTabNavigator<BottomTabParamList>();

const StockStack = createNativeStackNavigator<StockStackParamList>();

const StockStackNavigator = ({ route }: StockTabProps) => {
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
    <StockContextProvider stockId={deliveryId}>
      <StockStack.Navigator screenOptions={{ headerShown: true }}>
        <StockStack.Screen
          name="StockTabScreen"
          component={StockTabScreen}
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
        <StockStack.Screen
          name="RecordScreen"
          component={RecordScreen}
          initialParams={{ stockType: "delivery" }}
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
        <StockStack.Screen
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
      </StockStack.Navigator>
    </StockContextProvider>
  );
};

export const BottomTabNavigation = ({}: BottomTabProps) => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="ListTab"
      tabBar={(props) => <TabBar {...props} />}
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
        name="StockTab"
        component={StockStackNavigator}
        options={{
          // VISUAL
          title: "Stock",
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.highlight,
          // VISUAL
          tabBarIcon: () =>
            false ? (
              <DeliveryIcon color="darkGrey" size={37} />
            ) : (
              <InventoryIcon color="darkGrey" size={37} />
            ),
          headerShown: false,
          lazy: false,
        }}
      />
    </Tab.Navigator>
  );
};
