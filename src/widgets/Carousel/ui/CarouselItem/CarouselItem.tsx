import type { FC } from "react";
import styles from "./CarouselItem.module.scss";

interface Props {
  img: string;
  link: string;
}

export const CarouselItem: FC<Props> = ({ img, link }) => {
  return (
    <a
      href={link}
      className={styles["carousel-item"]}
      style={{ backgroundImage: `url(${img})` }}
    ></a>
  );
};
