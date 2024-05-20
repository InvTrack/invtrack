import { Dimensions } from "react-native";
import { isIos } from "../constants";

export const deviceDimensions = Dimensions.get("window");
export const isWideScreen = (width: number) => width >= 600;
const getShorterScreenSide = (width: number, height: number) =>
  Math.min(width, height);

export const isBigScreen = (width: number, height: number) =>
  isWideScreen(getShorterScreenSide(width, height));

export const getKeyboardVerticalOffset = () => {
  const isScreenBig = isBigScreen(
    deviceDimensions.width,
    deviceDimensions.height
  );

  if (isIos) {
    return isScreenBig ? 120 : 180;
  }
  return isScreenBig ? 160 : 220;
};

export const formatFloatString = (value: string): number =>
  parseFloat(value.replace(/,/g, "."));

export const roundFloat = (value: number): number =>
  Math.round(value * 100) / 100;

export const formatAndRoundFloat = (value: string): number =>
  roundFloat(formatFloatString(value));
