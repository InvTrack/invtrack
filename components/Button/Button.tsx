import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import debounce from "lodash/debounce";
import { createStyles } from "../../theme/useStyles";
import { mainTheme, ThemeColors } from "../../theme";

type onPress = (event: GestureResponderEvent) => void;
type ButtonProps = {
  onPress: onPress;
  buttonContent: string | JSX.Element;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  color: ThemeColors;
  disabled?: boolean;
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({ buttonStyle: {} })
);

const debouncedOnPress = (onPress: onPress) => debounce(onPress, 50);

// TODO switch to our own Text component
const Button = ({
  onPress,
  buttonContent,
  containerStyle,
  labelStyle,
  // labelColor, TODO
  color = "primary",
  disabled = false,
}: ButtonProps) => {
  const styles = useStyles();

  return (
    <TouchableOpacity
      onPress={debouncedOnPress(onPress)}
      style={[
        styles.buttonStyle,
        { backgroundColor: mainTheme.colors[color] },
        containerStyle,
      ]}
      disabled={disabled}
    >
      {!!buttonContent && <Text style={labelStyle}>{buttonContent}</Text>}
    </TouchableOpacity>
  );
};

export default Button;
