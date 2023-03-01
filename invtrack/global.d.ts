import "@react-navigation/native";
import { MainTheme } from "./theme";

declare module "@react-navigation/native" {
  export function useTheme(): MainTheme;
}
