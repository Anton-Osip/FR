import type { FC } from "react";
import styles from "./FooterMenu.module.scss";

interface FooterMenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface Props {
  items: FooterMenuItem[];
  className?: string;
}

export const FooterMenu: FC<Props> = ({ items, className }) => {
  return (
    <div
      className={`${styles["footer-menu"]} ${
        className ? styles[className] : ""
      }`}
    >
      {items.map((item) => (
        <div className={styles["footer-column"]} key={item.title}>
          <h4 className={styles["footer-column-title"]}>{item.title}</h4>
          <ul className={styles["footer-links"]}>
            {item.links.map((link) => (
              <li key={link.text}>
                <a href={link.url}>{link.text}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
