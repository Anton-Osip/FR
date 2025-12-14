import { Button } from "@shared/ui/button";
import { useState, type FC, type SVGProps } from "react";
import { CarouselItem } from "./CarouselItem";
import { type CarouselItemProps } from "../types/types";
import { CAROUSEL_MAX_ITEMS } from "../constants/constants";
import { ChevronRightIcon, ChevronLeftIcon } from "@radix-ui/react-icons";
import styles from "../Carousel.module.scss";

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  items: CarouselItemProps[];
}

export const Carousel: FC<Props> = ({ title, icon: Icon, items }) => {
  const [startIndex, setStartIndex] = useState<number>(0);

  const handleNext = () => {
    if (startIndex + CAROUSEL_MAX_ITEMS < items.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const visibleItems = items.slice(startIndex, startIndex + CAROUSEL_MAX_ITEMS);

  const controlButtons = [
    {
      icon: ChevronLeftIcon,
      onClick: handlePrev,
      disabled: startIndex === 0,
    },
    {
      icon: ChevronRightIcon,
      onClick: handleNext,
      disabled: startIndex + CAROUSEL_MAX_ITEMS >= items.length,
    },
  ];

  return (
    <div className={styles["carousel"]}>
      <div className={styles["carousel-header"]}>
        <div className={styles["carousel-title"]}>
          <Icon />
          <h3>{title}</h3>
        </div>
        <div className={styles["carousel-header-buttons"]}>
          <Button
            variant="secondary"
            size="s"
            className={styles["carousel-header-button"]}
          >
            Все
          </Button>
          <div className={styles["carousel-header-controls"]}>
            {controlButtons.map((btn) => {
              return (
                <Button
                  variant="secondary"
                  square
                  icon={btn.icon}
                  onClick={btn.onClick}
                  className={styles["carousel-header-button"]}
                  disabled={btn.disabled}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles["carousel-flexbox"]}>
        {visibleItems.map((item) => {
          return <CarouselItem key={item.id} img={item.img} link={item.link} />;
        })}
      </div>
    </div>
  );
};
