import type { FC } from "react";
import type { BankItem } from "../../types/types";
import styles from "./FooterMoneyItem.module.scss";

interface Props {
  text: string;
  items: BankItem[];
}

export const FooterMoneyItem: FC<Props> = ({ text, items }) => {
  return (
    <div className={styles["footer-money-item"]}>
      <span>{text}</span>
      <div className={styles["footer-money-item-wrap"]}>
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className={styles["footer-money-item-circle"]}
              title={item.label}
            >
              {item.gradient && (
                <div
                  className={styles["circle-gradient"]}
                  style={{ background: item.gradient }}
                />
              )}
              <img src={item.image} alt={item.label} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
