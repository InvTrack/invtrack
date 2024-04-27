import { Camera } from "expo-camera";
import React, { useEffect } from "react";
import { Linking, StyleSheet } from "react-native";

import { Button } from "../components/Button";

import { Typography } from "../components/Typography";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import isEmpty from "lodash/isEmpty";
import { DocumentScanner } from "../components/DocumentScanner";
import { EmptyScreenTemplate } from "../components/EmptyScreenTemplate";
import { LoadingSpinner } from "../components/LoadingSpinner";
import SafeLayout from "../components/SafeLayout";
import { HomeStackParamList } from "../navigation/types";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { createStyles } from "../theme/useStyles";

export type DocumentScannerModalScreen = NativeStackScreenProps<
  HomeStackParamList,
  "DocumentScannerModal"
>;

export const DocumentScannerModalScreen = ({
  navigation,
  route,
}: DocumentScannerModalScreen) => {
  const styles = useStyles();
  const isScanningSalesRaport = route.params.isScanningSalesRaport;
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const inventory_id = useAppSelector(
    documentScannerSelector.selectInventoryId
  );
  const processedInvoice = useAppSelector(
    documentScannerSelector.selectProcessedInvoice
  );
  const processedSalesRaport = useAppSelector(
    documentScannerSelector.selectProcessedSalesRaport
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isScanningSalesRaport && processedSalesRaport != null) {
      if (inventory_id && !isEmpty(processedSalesRaport?.unmatchedAliases)) {
        navigation.replace("IdentifyAliasesScreen", {
          inventoryId: inventory_id,
        });
      } else {
        navigation.goBack();
      }
      dispatch(documentScannerAction.PHOTO_RESET_DATA());
      return;
    }
    if (processedInvoice != null)
      if (inventory_id && !isEmpty(processedInvoice?.unmatchedAliases)) {
        navigation.replace("IdentifyAliasesScreen", {
          inventoryId: inventory_id,
        });
      } else {
        navigation.goBack();
      }
    dispatch(documentScannerAction.PHOTO_RESET_DATA());
    return;
  }, [
    isScanningSalesRaport,
    inventory_id,
    processedInvoice,
    processedSalesRaport,
  ]);

  const awaitingPermission = !permission;
  const permissionDeniedCanAskAgain =
    !permission?.granted && permission?.canAskAgain;
  const permissionDeniedCannotAskAgain =
    !permission?.granted && !permission?.canAskAgain;

  if (awaitingPermission) {
    return (
      <EmptyScreenTemplate style={styles.container}>
        <LoadingSpinner size="large" />
      </EmptyScreenTemplate>
    );
  }

  if (permissionDeniedCannotAskAgain) {
    // Camera permissions are not granted and can not be asked again
    return (
      <EmptyScreenTemplate style={styles.container}>
        <Typography
          variant="l"
          color="lightGrey"
          style={{ textAlign: "center" }}
        >
          Aby skorzystać ze skanera, pozwól aplikacji na dostęp do kamery.
        </Typography>
        <Typography
          variant="l"
          color="lightGrey"
          style={{
            textAlign: "center",
            marginTop: 32,
            alignSelf: "center",
          }}
        >
          Zmień to w ustawieniach telefonu.
        </Typography>
        <Button
          onPress={Linking.openSettings}
          size="l"
          type="primary"
          shadow
          containerStyle={{ marginTop: 32, width: 200, alignSelf: "center" }}
        >
          Ustawienia
        </Button>
      </EmptyScreenTemplate>
    );
  }

  if (permissionDeniedCanAskAgain) {
    // Camera permissions are not granted yet
    return (
      <EmptyScreenTemplate style={styles.container}>
        <Typography
          variant="l"
          color="lightGrey"
          style={{ textAlign: "center" }}
        >
          Aby skorzystać ze skanera, pozwól aplikacji na dostęp do kamery.
        </Typography>
        <Button
          onPress={requestPermission}
          size="l"
          type="primary"
          shadow
          containerStyle={{ marginTop: 16, width: 200, alignSelf: "center" }}
        >
          Zapytaj o dostęp
        </Button>
      </EmptyScreenTemplate>
    );
  }

  return (
    <SafeLayout style={styles.container}>
      <DocumentScanner isScanningSalesRaport={isScanningSalesRaport} />
    </SafeLayout>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: theme.colors.darkBlue,
      height: "100%",
    },
  })
);
