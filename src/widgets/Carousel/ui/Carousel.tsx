import { Button } from "@shared/ui/button";
import { useEffect, useState, type FC, type SVGProps } from "react";
import { CarouselItem } from "./CarouselItem";
import { type CarouselItemProps } from "../types/types";
import { ChevronRightIcon, ChevronLeftIcon } from "@radix-ui/react-icons";
import styles from "../Carousel.module.scss";
import { useCarouselMaxItems } from "../hooks/useCarouselMaxItems";

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  items: CarouselItemProps[];
}

export const Carousel: FC<Props> = ({ title, icon: Icon, items }) => {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [direction, setDirection] = useState<"left" | "right" | null>("right");
  const [animatingItemIndex, setAnimatingItemIndex] = useState<number | null>(
    null
  );

  const maxItems = useCarouselMaxItems();

  const handleNext = () => {
    if (startIndex + maxItems < items.length) {
      setDirection("right");
      setAnimatingItemIndex(maxItems - 1);
      setStartIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setDirection("left");
      setAnimatingItemIndex(0);
      setStartIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (animatingItemIndex !== null) {
      const timer = setTimeout(() => {
        setAnimatingItemIndex(null);
        setDirection(null);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [animatingItemIndex]);

  const visibleItems = items.slice(startIndex, startIndex + maxItems);

  const controlButtons = [
    {
      id: "1",
      icon: ChevronLeftIcon,
      onClick: handlePrev,
      disabled: startIndex === 0,
    },
    {
      id: "2",
      icon: ChevronRightIcon,
      onClick: handleNext,
      disabled: startIndex + maxItems >= items.length,
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
                  key={btn.id}
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
        {visibleItems.map((item, index) => {
          const shouldAnimate =
            index === animatingItemIndex && direction !== null;
            
          return (
            <CarouselItem
              key={item.id}
              img={item.img}
              link={item.link}
              direction={shouldAnimate ? direction : null}
            />
          );
        })}
      </div>
    </div>
  );
};
