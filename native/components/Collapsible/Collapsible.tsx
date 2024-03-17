import React, { ReactElement, useState } from "react";

import { SectionList, StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { ExpandMoreIcon } from "../Icon";
import { Typography } from "../Typography";

type CollapsibleSection = {
  title: string;
  data: ReactElement[];
};

export const Collapsible = ({
  sections,
  ListHeaderComponent,
}: {
  sections: CollapsibleSection[] | null | undefined;
  ListHeaderComponent: ReactElement;
}) => {
  const [expandedSection, setExpandedSection] =
    useState<CollapsibleSection | null>(null);
  const styles = useStyles();

  if (sections == null) {
    return null;
  }

  const toggleExpand = (section: CollapsibleSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderHeader = ({ section }: { section: CollapsibleSection }) => (
    <Card
      color="mediumBlue"
      style={
        section === expandedSection
          ? styles.expandedSectionCard
          : styles.sectionCard
      }
      padding="dense"
      onPress={() => toggleExpand(section)}
    >
      <ExpandMoreIcon
        color="lightGrey"
        style={[
          styles.iconMargin,
          section === expandedSection && { transform: [{ rotate: "-90deg" }] },
        ]}
      />
      <Typography variant="lBold" color="lightGrey">
        {section.title}
      </Typography>
    </Card>
  );

  return (
    <SectionList
      ListHeaderComponent={ListHeaderComponent}
      style={styles.scroll}
      contentContainerStyle={styles.bottomPadding}
      sections={sections}
      renderSectionHeader={renderHeader}
      renderItem={({ item, section }) =>
        section === expandedSection ? item : null
      }
      keyExtractor={(item, index) => item.key || index.toString()}
    />
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
    expandedSectionCard: {
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
