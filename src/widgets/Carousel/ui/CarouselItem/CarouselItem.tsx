import type { FC } from "react";
import styles from "./CarouselItem.module.scss";

interface Props {
  img: string;
  link: string;
  direction: "left" | "right" | null;
}

export const CarouselItem: FC<Props> = ({ img, link, direction }) => {
  return (
    <a
      href={link}
      className={[
        styles["carousel-item"],
        direction ? styles[`slide-${direction}`] : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundImage: `url(${img})` }}
    ></a>
  );
};
