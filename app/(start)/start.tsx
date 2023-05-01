import React from "react";
import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Button } from "../../components/Button";
import { Link } from "expo-router";
import { Card } from "../../components/Card";
import { createStyles } from "../../theme/useStyles";
import { Typography } from "../../components/Typography";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PencilIcon,
} from "../../components/Icon";

const ProductButton = ({
  label,
  style,
}: {
  label: string;
  style?: StyleProp<ViewStyle>;
}) => {
  return (
    <Button
      size="l"
      type="primary"
      containerStyle={[
        {
          borderRadius: 5,
          width: 72,
          height: 72,
        },
        style,
      ]}
    >
      <Typography variant="l">{label}</Typography>
    </Button>
  );
};

export default function Start() {
  const styles = useStyles();

  // temporary - move it to [product]
  const workOnProduct = false;
  if (workOnProduct) {
    return (
      <View style={styles.INVcontainer}>
        <View style={styles.INVtopBar}>
          <Typography variant="xsBold">
            {/* nazwa inwentaryzacji z backendu */}
            inwentaryzacja 18:00 bardzo długa nazwa inwentaryzacjiii dahdsajda
          </Typography>
        </View>
        <View style={styles.INVcontentContainer}>
          <Typography variant="xlBold" underline style={styles.INVtitle}>
            {/* nazwa produktu */}
            Papryka
          </Typography>
          <View style={styles.INVcontent}>
            <Typography variant="l" underline style={styles.INVwasTitle}>
              Ile było:
            </Typography>
            <Typography variant="xlBold" style={styles.INVwasAmount}>
              {/* liczba + jednostka previous*/}
              10 szt
            </Typography>
            <View style={styles.INVgridRow}>
              <View style={styles.INVfirstColumn}>
                <ProductButton label={`-1`} />
                <ProductButton label={`-5`} />
                <ProductButton label={`-10`} />
                <Button type="primary" size="l">
                  <ArrowRightIcon size={32} />
                </Button>
              </View>
              <View style={styles.INVsecondColumn}>
                <Typography underline>Ile jest:</Typography>
                <Typography variant="xlBold" style={styles.INVtitle}>
                  {/* liczba + jednostka current */}
                  20 szt
                </Typography>
                <Button
                  type="primary"
                  size="xl"
                  containerStyle={styles.INVeditButton}
                >
                  <PencilIcon size={32} />
                </Button>
              </View>
              <View style={styles.INVthirdColumn}>
                <ProductButton label={`+1`} />
                <ProductButton label={`+5`} />
                <ProductButton label={`+10`} />
                <Button type="primary" size="l">
                  <ArrowLeftIcon size={32} />
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Card borderBottom padding="normal" style={styles.card}>
        <Image
          source={require("../../assets/images/logo.png")}
          resizeMode="contain"
          style={styles.logoImage}
        />
      </Card>
      <Link href="/register" asChild>
        <Button type="primary" size="l" containerStyle={styles.button}>
          <Typography variant="l">Register</Typography>
        </Button>
      </Link>
      <Link href="/login" asChild>
        <Button type="secondary" size="l" containerStyle={styles.button}>
          <Typography variant="l">Login</Typography>
        </Button>
      </Link>
      <Link href={""}>Regulamin</Link>
    </View>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    INVtopBar: {
      ...theme.baseShadow,
      width: "100%",
      backgroundColor: theme.colors.mediumBlue,
      height: 50,
      justifyContent: "center",
      textAlign: "center",
    },
    INVcontainer: { backgroundColor: theme.colors.lightBlue, height: "100%" },
    INVcontentContainer: { paddingHorizontal: 24 },
    INVtitle: { marginTop: 24 },
    INVwasTitle: { marginTop: 44 },
    INVwasAmount: { marginTop: 16 },
    INVcontent: { alignItems: "center" },
    INVgridRow: { flexDirection: "row" },
    INVfirstColumn: { flexDirection: "column", alignItems: "flex-start" },
    INVsecondColumn: {
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "center",
      marginHorizontal: 16,
    },
    INVeditButton: {
      marginTop: 24,
      borderRadius: 5,
      width: 72,
      height: 72,
      marginBottom: 58 + 12,
    },
    INVthirdColumn: { flexDirection: "column", alignItems: "flex-end" },
    container: { backgroundColor: theme.colors.lightBlue, height: "100%" },
    card: {
      ...theme.baseShadow,
      justifyContent: "center",
      alignContent: "center",
      marginBottom: theme.spacing * 11,
    },
    logoImage: {
      width: 256,
      height: 256,
      marginHorizontal: "auto",
    },
    button: {
      marginHorizontal: "auto",
      width: 200,
      marginBottom: theme.spacing * 2.5,
    },
  })
);
