import { useEffect, useState } from "react";
import {
  CAROUSEL_MAX_ITEMS,
  LAPTOP_BREAKPOINT,
  TAB_MINI_BREAKPOINT,
} from "../constants/constants";

export const useCarouselMaxItems = (): number => {
  const getMaxItems = () => {
    const width = window.innerWidth;

    if (width > LAPTOP_BREAKPOINT) {
      return CAROUSEL_MAX_ITEMS.desk;
    }

    if (width > TAB_MINI_BREAKPOINT) {
      return CAROUSEL_MAX_ITEMS.tab;
    }

    return CAROUSEL_MAX_ITEMS.mob;
  };

  const [maxItems, setMaxItems] = useState<number>(getMaxItems);

  useEffect(() => {
    const handleResize = () => {
      setMaxItems(getMaxItems());
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return maxItems;
};
