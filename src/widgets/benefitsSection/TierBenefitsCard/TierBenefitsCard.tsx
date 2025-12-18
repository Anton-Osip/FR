import type { FC, JSX } from "react";
import type { BenefitCard } from "../types/types";
import * as Separator from "@radix-ui/react-separator";
import styles from "./TierBenefitsCard.module.scss";

interface Props {
  card: BenefitCard;
}

export const TierBenefitsCard: FC<Props> = ({ card }) => {
  const IconComponent = card.icon;
  const bgIcons = Array(7).fill(card.bgIcon);
  const rowScheme = [2, 3, 2];

  return (
    <div className={styles.card}>
      <div className={styles.backgroundIcons}>
        {
          rowScheme.reduce<{ row: JSX.Element[]; index: number }>(
            (acc, iconsInRow) => {
              const rowIcons = bgIcons.slice(
                acc.index,
                acc.index + iconsInRow
              );
              const rowElement = (
                <div key={acc.index} className={styles.row}>
                  {rowIcons.map((Icon, i) => (
                    <span key={i}>
                      <Icon />
                    </span>
                  ))}
                </div>
              );
              acc.row.push(rowElement);
              acc.index += iconsInRow;
              return acc;
            },
            { row: [], index: 0 }
          ).row
        }
      </div>
      <span className={styles.icon}>
        <IconComponent />
      </span>
      <h3 className={styles.title}>{card.title}</h3>
      <p className={styles.description}>{card.description}</p>
      <Separator.Root className={styles.separator} />
      <ul className={styles.list}>
        {card.cardList.map((item) => {
          return (
            <li
              key={item.id}
              className={`${item.isActive ? styles.active : ""}`}
            >
              {item.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
