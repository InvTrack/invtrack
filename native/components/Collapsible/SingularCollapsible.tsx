import React, { ReactNode, useState } from "react";

import { StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { ExpandMoreIcon } from "../Icon";
import { Typography } from "../Typography";

export const SingularCollapsible = ({
  children,
  title,
}: {
  title: string;
  children: ReactNode;
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const styles = useStyles();

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <>
      <Card
        color="mediumBlue"
        style={expanded ? styles.expandedCard : styles.sectionCard}
        padding="dense"
        onPress={() => toggleExpand()}
      >
        <ExpandMoreIcon
          color="lightGrey"
          style={[
            styles.iconMargin,
            expanded && { transform: [{ rotate: "-90deg" }] },
          ]}
        />
        <Typography variant="lBold" color="lightGrey">
          {title}
        </Typography>
      </Card>
      {expanded && children}
    </>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    scroll: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.darkBlue,
      padding: theme.spacing * 2,
      marginBottom: theme.spacing * 40,
    },
    bottomPadding: {
      paddingBottom: theme.spacing * 8,
    },
    iconMargin: { marginRight: 8 },
    sectionCard: {
      alignItems: "center",
      flexDirection: "row",
      paddingLeft: theme.spacing * 2,
      paddingRight: theme.spacing * 2,
      marginTop: theme.spacing * 3,
      borderRadius: theme.borderRadiusSmall,
      borderWidth: 3,
      borderColor: theme.colors.highlight,
    },
    expandedCard: {
      alignItems: "center",
      flexDirection: "row",
      paddingLeft: theme.spacing * 2,
      paddingRight: theme.spacing * 2,
      marginTop: theme.spacing * 3,
      borderRadius: theme.borderRadiusSmall,
      borderWidth: 3,
      borderColor: theme.colors.highlight,
      borderBottomWidth: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  })
);
