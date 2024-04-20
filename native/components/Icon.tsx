import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  GestureResponderEvent,
  Image,
  ImageStyle,
  ImageURISource,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { MainTheme } from "../theme";

export interface InternalIconProps {
  source: ImageURISource;
  color?: keyof MainTheme["colors"];
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  size?: number;
  disabled?: boolean;
}

export type IconProps = Omit<InternalIconProps, "source">;

const Icon = ({
  source,
  color,
  onPress,
  style,
  containerStyle,
  size = 16,
  disabled,
}: InternalIconProps) => {
  const theme = useTheme();
  return onPress ? (
    <TouchableOpacity
      onPress={onPress}
      style={containerStyle}
      disabled={disabled}
      activeOpacity={0.4}
    >
      <Image
        source={source}
        style={[
          styles.icon,
          {
            tintColor: color ? theme.colors[color] : undefined,
          },
          { width: size, height: size },
          style,
        ]}
      />
    </TouchableOpacity>
  ) : (
    <View style={containerStyle}>
      <Image
        source={source}
        style={[
          styles.icon,
          {
            tintColor: color ? theme.colors[color] : undefined,
          },
          { width: size, height: size },
          style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    maxHeight: "100%",
    maxWidth: "100%",
    padding: 0,
    margin: 0,
    resizeMode: "contain",
  },
});

const createIcon = ({
  source,
  props,
}: {
  source: ImageURISource;
  props: IconProps;
}) => <Icon source={source} {...props} />;

const pencilIconSrc = require("../assets/images/pencil.png");
export const PencilIcon = (props: IconProps) =>
  createIcon({ source: pencilIconSrc, props });

const arrowRightIconSrc = require("../assets/images/arrow-right.png");
export const ArrowRightIcon = (props: IconProps) =>
  createIcon({ source: arrowRightIconSrc, props });

const arrowLeftIconSrc = require("../assets/images/arrow-left.png");
export const ArrowLeftIcon = (props: IconProps) =>
  createIcon({ source: arrowLeftIconSrc, props });

const homeIconSrc = require("../assets/images/home.png");
export const HomeIcon = (props: IconProps) =>
  createIcon({ source: homeIconSrc, props });

const smallerArrowRightIconSrc = require("../assets/images/smaller-arrow-right.png");
export const SmallerArrowRightIcon = (props: IconProps) =>
  createIcon({ source: smallerArrowRightIconSrc, props });

const plusIconSrc = require("../assets/images/plus.png");
export const PlusIcon = (props: IconProps) =>
  createIcon({ source: plusIconSrc, props });

const cogIconSrc = require("../assets/images/cog.png");
export const CogIcon = (props: IconProps) =>
  createIcon({ source: cogIconSrc, props });

const listIconSrc = require("../assets/images/list.png");
export const ListIcon = (props: IconProps) =>
  createIcon({ source: listIconSrc, props });

const inventoryIconSrc = require("../assets/images/inventory.png");
export const InventoryIcon = (props: IconProps) =>
  createIcon({ source: inventoryIconSrc, props });

const cameraSwitchIconSrc = require("../assets/images/camera-switch.png");
export const CameraSwitchIcon = (props: IconProps) =>
  createIcon({ source: cameraSwitchIconSrc, props });

export const ScanBarcodeIconSrc = require("../assets/images/scan-barcode.png");
export const ScanBarcodeIcon = (props: IconProps) =>
  createIcon({ source: ScanBarcodeIconSrc, props });

export const DeliveryIconSrc = require("../assets/images/delivery.png");
export const DeliveryIcon = (props: IconProps) =>
  createIcon({ source: DeliveryIconSrc, props });

export const ExpandMoreIconSrc = require("../assets/images/expand-more.png");
export const ExpandMoreIcon = (props: IconProps) =>
  createIcon({ source: ExpandMoreIconSrc, props });

export const checkmarkIconSrc = require("../assets/images/checkmark.png");
export const CheckmarkIcon = (props: IconProps) =>
  createIcon({ source: checkmarkIconSrc, props });

export const documentScannerIconSrc = require("../assets/images/document_scanner.png");
export const DocumentScannerIcon = (props: IconProps) =>
  createIcon({ source: documentScannerIconSrc, props });

const infoIconSrc = require("../assets/images/info.png");
export const InfoIcon = (props: IconProps) =>
  createIcon({ source: infoIconSrc, props });

const AppIconSrc = require("../assets/images/icon.png");
export const AppIcon = (props: IconProps) =>
  createIcon({
    source: AppIconSrc,
    props: {
      ...props,
      containerStyle: {
        elevation: 5,
        shadowColor: "#fff",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      style: {
        borderRadius: 20,
      },
    },
  });
