import { Linking, TouchableOpacity } from "react-native";
import { Typography } from "./common/Typography";

export const PrivacyPolicy = () => {
  return (
    <TouchableOpacity
      onPress={() =>
        Linking.openURL("https://invtrack.app/polityka-prywatnosci")
      }
      style={{ alignSelf: "center", marginTop: 64 }}
    >
      <Typography variant="m" color="darkGrey">
        Polityka prywatności
      </Typography>
    </TouchableOpacity>
  );
};
