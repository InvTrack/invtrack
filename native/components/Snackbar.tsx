import { useTheme } from "@react-navigation/native";
import { ReactNode } from "react";
import {
  createNotifications,
  useNotifications,
} from "react-native-notificated";

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  const { NotificationsProvider } = createNotifications({
    duration: 5000,
    notificationPosition: "top",
    defaultStylesSettings: {
      successConfig: {
        defaultIconType: "monochromatic",
        borderType: "no-border",
        bgColor: theme.colors.green,
        notificationPosition: "top",
      },
    },
  });
  return <NotificationsProvider>{children}</NotificationsProvider>;
};

export const useSnackbar = useNotifications;
