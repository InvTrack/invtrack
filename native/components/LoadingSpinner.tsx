import { useTheme } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
export const LoadingSpinner = () => {
  const theme = useTheme();
  return <ActivityIndicator size={17} color={theme.colors.darkBlue} />;
};
