import { useEffect, useState } from "react";
import { Dimensions, ScaledSize } from "react-native";

export const useDimensions = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const handleDimensionsChange = ({
      window,
    }: {
      window: ScaledSize;
      screen: ScaledSize;
    }) => {
      setDimensions(window);
    };

    const changeSubscribtion = Dimensions.addEventListener(
      "change",
      handleDimensionsChange
    );
    return () => {
      changeSubscribtion.remove();
    };
  });

  return {
    ...dimensions,
  };
};
