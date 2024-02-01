import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

/**
 * Login Stack
 */
export type LoginStackParamList = {
  LoginScreen: undefined;
  StartScreen: undefined;
};

/**
 * Home Stack
 */
export type HomeStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList>;
  BarcodeModal: {
    inventoryId: number;
    navigateTo: "InventoryTab" | "DeliveryTab";
  };
  SettingsScreen: undefined;
  NewBarcodeScreen: { inventoryId: number; new_barcode: string };
  NewStockScreen: undefined;
};

/**
 * Bottom Tabs
 */
export type BottomTabParamList = {
  ListTab: undefined;
  DeliveryTab: { id?: number };
  InventoryTab: { id?: number };
};
export type BottomTabProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "Tabs">,
  NativeStackScreenProps<BottomTabParamList>
>;

/**
 * List Tab/Stack
 */
export type ListTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "ListTab">,
  NativeStackScreenProps<{}>
>;
export type ListTabScreenNavigationProp = ListTabScreenProps["navigation"];

/**
 * Inventory Tab/Stack
 */
export type InventoryStackParamList = {
  InventoryTabScreen: { id: number };
  RecordScreen: { id: number; recordId: number };
};
export type InventoryTabProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "InventoryTab">,
  NativeStackScreenProps<InventoryStackParamList>
>;
export type InventoryTabNavigationProp = InventoryTabProps["navigation"];

export type InventoryTabScreenProps = NativeStackScreenProps<
  InventoryStackParamList,
  "InventoryTabScreen"
>;
export type InventoryTabScreenNavigationProp =
  InventoryTabScreenProps["navigation"];
/**
 * Delivery Tab/Stack
 */
export type DeliveryStackParamList = {
  DeliveryTabScreen: { id: number };
  RecordScreen: { id: number; recordId: number };
};
export type DeliveryTabProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "DeliveryTab">,
  NativeStackScreenProps<DeliveryStackParamList>
>;
export type DeliveryTabNavigationProp = DeliveryTabProps["navigation"];

export type DeliveryTabScreenProps = NativeStackScreenProps<
  DeliveryStackParamList,
  "DeliveryTabScreen"
>;
export type DeliveryTabScreenNavigationProp =
  DeliveryTabScreenProps["navigation"];

/**
 * Record Screen
 */
export type RecordScreenNavigationProp = NativeStackScreenProps<
  InventoryStackParamList | DeliveryStackParamList,
  "RecordScreen"
>["navigation"];
