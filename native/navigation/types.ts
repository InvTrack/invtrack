import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ProcessInvoiceResponse,
  ProcessSalesRaportResponse,
} from "../db/types";
import { AliasForm } from "../screens/IdentifyAliasesScreen/types";
import {
  ProductRecordsByProductId,
  RecipeRecordsByRecipeId,
} from "../screens/StockTabScreen/StockContext/types";

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
    navigateTo: "StockTab";
  };
  DocumentScannerModal: {
    stockId: number;
    stockType: "delivery" | "inventory";
  };
  SettingsScreen: undefined;
  NewBarcodeScreen: { inventoryId: number; new_barcode: string };
  NewStockScreen: undefined;
  NewProductScreen: { inventoryId: number };
  IdentifyAliasesScreen: {
    stockId: number;
    stockType: "delivery" | "inventory";
    processedInvoice: ProcessInvoiceResponse;
    processedSalesReport: ProcessSalesRaportResponse;
  };
};

/**
 * Bottom Tabs
 */
export type BottomTabParamList = {
  ListTab: undefined;
  StockTab: { id?: number };
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
 * Stock Tab/Stack
 */
export type StockStackParamList = {
  StockTabScreen: {
    id: number;
    stockType: "delivery" | "inventory";
    recordsFromInvoice?: ProductRecordsByProductId;
    recordsFromSalesRaport?: RecipeRecordsByRecipeId;
    aliasForm?: AliasForm;
  };
  RecordScreen: {
    id: number;
    recordId: number;
    productId: number;
    stockType: "delivery" | "inventory";
  };
  AddRecordScreen: { stockId: number };
};
export type StockTabProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "StockTab">,
  NativeStackScreenProps<StockStackParamList>
>;
export type StockTabNavigationProp = StockTabProps["navigation"];

export type StockTabScreenProps = NativeStackScreenProps<
  StockStackParamList,
  "StockTabScreen"
>;
export type StockTabScreenNavigationProp = StockTabScreenProps["navigation"];

/**
 * Record Screen
 */
export type RecordScreenNavigationProp = NativeStackScreenProps<
  StockStackParamList,
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
