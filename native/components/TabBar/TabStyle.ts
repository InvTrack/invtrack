import { StyleSheet } from "react-native";

export const CleanTabBarStyle = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
  },
  content: {
    minHeight: 55,
    flexDirection: "row",
    marginBottom: 2,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  touchableItem: {
    flex: 1,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  itemIconLayer: {
    position: "absolute",
    zIndex: 1,
  },
  itemIconNotFound: {
    borderWidth: 2,
    width: 23,
    height: 23,
  },
  filterIcon: {
    zIndex: 2,
    position: "absolute",
    width: "100%",
  },
  itemTextLayer: {
    zIndex: 3,
    position: "absolute",
  },
  itemText: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  filterText: {
    zIndex: 4,
    position: "absolute",
    bottom: -5,
    width: "100%",
  },
  triangleTop: {
    width: "100%",
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 0,
    borderRightWidth: 180,
    borderBottomWidth: 20,
    borderLeftWidth: 0,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderLeftColor: "transparent",
    marginBottom: -1,
  },
  triangleBottom: {
    width: "100%",
    height: 50,
    marginBottom: -50,
  },
  itemDot: {
    zIndex: 5,
    width: 5,
    height: 5,
    borderRadius: 50,
    position: "absolute",
    bottom: 5,
  },
});
