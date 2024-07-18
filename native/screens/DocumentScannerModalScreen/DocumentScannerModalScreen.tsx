import { useCameraPermissions } from "expo-camera";
import React, { useEffect } from "react";
import { Linking, StyleSheet } from "react-native";

import { Button } from "../../components/common/Button";

import { Typography } from "../../components/common/Typography";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import isEmpty from "lodash/isEmpty";
import { useImmer } from "use-immer";
import { EmptyScreenTemplate } from "../../components/common/EmptyScreenTemplate";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import SafeLayout from "../../components/common/SafeLayout";
import { HomeStackParamList } from "../../navigation/types";
import { createStyles } from "../../theme/useStyles";
import { DocumentScanner } from "./DocumentScanner";
import {
  DocumentScannerContext,
  DocumentScannerState,
  initialDocumentScannerState,
} from "./DocumentScannerContext";

export type DocumentScannerModalScreen = NativeStackScreenProps<
  HomeStackParamList,
  "DocumentScannerModal"
>;

export const DocumentScannerModalScreen = ({
  navigation,
  route,
}: DocumentScannerModalScreen) => {
  const [documentScannerState, updateDocumentScannerState] =
    useImmer<DocumentScannerState>(initialDocumentScannerState);

  const resetDocumentScanner = () =>
    updateDocumentScannerState(initialDocumentScannerState);

  const styles = useStyles();
  const { isScanningSalesRaport, stockId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();

  const { processedInvoice, processedSalesReport } = documentScannerState;

  useEffect(() => {
    if (isScanningSalesRaport && processedSalesReport != null) {
      if (stockId && !isEmpty(processedSalesReport?.unmatchedAliases)) {
        navigation.replace("IdentifyAliasesScreen", {
          stockId,
          isScanningSalesRaport,
          processedInvoice: null,
          processedSalesReport,
        });
      } else {
        navigation.goBack();
      }
      resetDocumentScanner();
      return;
    }
    if (processedInvoice != null)
      if (stockId && !isEmpty(processedInvoice?.unmatchedRows)) {
        navigation.replace("IdentifyAliasesScreen", {
          stockId,
          isScanningSalesRaport,
          processedInvoice,
          processedSalesReport: null,
        });
      } else {
        navigation.goBack();
      }
    resetDocumentScanner();
    return;
  }, [isScanningSalesRaport, stockId, processedInvoice, processedSalesReport]);

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
      <DocumentScannerContext.Provider
        value={{
          documentScannerState,
          updateDocumentScannerState,
          resetDocumentScanner,
        }}
      >
        <DocumentScanner
          isScanningSalesRaport={isScanningSalesRaport}
          stockId={stockId}
        />
      </DocumentScannerContext.Provider>
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
