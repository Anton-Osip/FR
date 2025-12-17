import type { FC } from "react";
import styles from "./Breadcrumbs.module.scss";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        <li className={styles.item}>
          <a href="/" className={styles.link}>
            Главная
          </a>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className={styles.item}>
              {isLast || !item.href ? (
                <span className={styles.current}>{item.label}</span>
              ) : (
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
