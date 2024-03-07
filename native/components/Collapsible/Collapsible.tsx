import React, { ReactElement, useState } from "react";

import { SectionList, StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { Typography } from "../Typography";

type CollapsibleSection = {
  title: string;
  data: ReactElement[];
};

export const Collapsible = ({
  sections,
  ListHeaderComponent,
}: {
  sections: CollapsibleSection[];
  ListHeaderComponent: ReactElement;
}) => {
  const [expandedSection, setExpandedSection] =
    useState<CollapsibleSection | null>(null);
  const styles = useStyles();

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
      <Typography variant="lBold" color="lightGrey">
        {expandedSection === section ? "⌄" : ">"} {section.title}
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
    sectionCard: {
      alignItems: "flex-start",
      justifyContent: "center",
      paddingLeft: theme.spacing * 2,
      paddingRight: theme.spacing * 2,
      marginTop: theme.spacing * 3,
      borderRadius: theme.borderRadiusSmall,
      borderWidth: 3,
      borderColor: theme.colors.lightBlue,
    },
    expandedSectionCard: {
      alignItems: "flex-start",
      justifyContent: "center",
      paddingLeft: theme.spacing * 2,
      paddingRight: theme.spacing * 2,
      marginBottom: -theme.spacing * 0.5,
      marginTop: theme.spacing * 2,
      borderRadius: theme.borderRadiusSmall,
      borderWidth: 3,
      borderColor: theme.colors.lightBlue,
      borderBottomWidth: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  })
);
