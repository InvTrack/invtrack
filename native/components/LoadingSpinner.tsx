import { useTheme } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
export const LoadingSpinner = ({
  size = 17,
}: {
  size?: number | "small" | "large";
}) => {
  const theme = useTheme();
  return <ActivityIndicator size={size} color={theme.colors.new_darkGrey} />;
};
