import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

/**
 * Update Required Stack
 */
export type UpdateRequiredStackParamList = {
  UpdateRequiredScreen: undefined;
};

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
  DocumentScannerModal: { isScanningSalesRaport: boolean };
  SettingsScreen: undefined;
  NewBarcodeScreen: { inventoryId: number; new_barcode: string };
  NewStockScreen: undefined;
  NewProductScreen: { inventoryId: number };
  IdentifyAliasesScreen: {
    inventoryId: number;
    isScanningSalesRaport: boolean;
  };
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
export type BottomTabNavigatorScreen = keyof BottomTabParamList;

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
  RecordScreen: { id: number; recordId: number; isDelivery?: boolean };
  AddRecordScreen: { inventoryId: number };
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
  RecordScreen: { id: number; recordId: number; isDelivery?: boolean };
  AddRecordScreen: { inventoryId: number };
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

/**
 * IdentifyAliasesScreen
 */
export type IdentifyAliasesScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "IdentifyAliasesScreen"
>;

export type IdentifyAliasesScreenNavigationProp = NativeStackScreenProps<
  HomeStackParamList,
  "IdentifyAliasesScreen"
>["navigation"];
