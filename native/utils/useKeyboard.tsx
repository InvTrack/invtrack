import { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardEventListener,
  KeyboardMetrics,
} from "react-native";
const { height } = Dimensions.get("window");
const emptyCoordinates = Object.freeze({
  screenX: 0,
  screenY: 0,
  width: 0,
  height: height * 0.2,
});
const initialValue = {
  start: emptyCoordinates,
  end: emptyCoordinates,
};

// TODO - improve this by creating a global cache + context, that is set (preferably) one time, when the keyboard is first shown.
// On subsequent keyboard opens, it would return the cached value and compare it to the current height, then act accordingly.
export function useKeyboard() {
  const [coordinates, setCoordinates] = useState<{
    start: undefined | KeyboardMetrics;
    end: KeyboardMetrics;
  }>(initialValue);

  const handleKeyboardWillShow: KeyboardEventListener = (e) => {
    setCoordinates({ start: e.startCoordinates, end: e.endCoordinates });
  };
  const handleKeyboardDidShow: KeyboardEventListener = (e) => {
    setCoordinates({ start: e.startCoordinates, end: e.endCoordinates });
  };
  const handleKeyboardWillHide: KeyboardEventListener = (e) => {
    setCoordinates({ start: e.startCoordinates, end: e.endCoordinates });
  };
  const handleKeyboardDidHide: KeyboardEventListener = (e) => {
    setCoordinates({ start: e.startCoordinates, end: e.endCoordinates });
  };

  useEffect(() => {
    const subscriptions = [
      Keyboard.addListener("keyboardWillShow", handleKeyboardWillShow),
      Keyboard.addListener("keyboardDidShow", handleKeyboardDidShow),
      Keyboard.addListener("keyboardWillHide", handleKeyboardWillHide),
      Keyboard.addListener("keyboardDidHide", handleKeyboardDidHide),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  return {
    coordinates,
  };
}
