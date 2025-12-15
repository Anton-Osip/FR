import { Button } from "@shared/ui/button";
import { type FC, type SVGProps } from "react";
import { CarouselItem } from "./CarouselItem";
import { type CarouselItemProps } from "../types/types";
import { ChevronRightIcon, ChevronLeftIcon } from "@radix-ui/react-icons";
import styles from "../Carousel.module.scss";
import { useCarouselMaxItems } from "../hooks/useCarouselMaxItems";
import { useCarousel } from "../hooks/useCarousel";

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  items: CarouselItemProps[];
}

export const Carousel: FC<Props> = ({ title, icon: Icon, items }) => {
  const maxItems = useCarouselMaxItems();

  const {
    visibleItems,
    direction,
    animatingItemIndex,
    dragOffsetX,
    isDragging,
    handleNext,
    handlePrev,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useCarousel({ items, maxItems });

  const controlButtons = [
    {
      id: "1",
      icon: ChevronLeftIcon,
      onClick: handlePrev,
      disabled: visibleItems[0] === items[0],
    },
    {
      id: "2",
      icon: ChevronRightIcon,
      onClick: handleNext,
      disabled:
        visibleItems[visibleItems.length - 1] === items[items.length - 1],
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
      <div
        className={styles.viewport}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className={styles["carousel-flexbox"]}
          style={{
            transform: `translateX(${dragOffsetX}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
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
    </div>
  );
};
