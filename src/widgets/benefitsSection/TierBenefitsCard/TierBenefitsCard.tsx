import { type FC, type JSX } from 'react';

import * as Separator from '@radix-ui/react-separator';

import type { BenefitCard } from '../types/types';

import styles from './TierBenefitsCard.module.scss';

interface Props {
  card: BenefitCard;
}

const BG_ICONS_COUNT = 7;
const FIRST_ROW_COUNT = 2;
const SECOND_ROW_COUNT = 3;
const THIRD_ROW_COUNT = 2;
const ROW_SCHEME = [FIRST_ROW_COUNT, SECOND_ROW_COUNT, THIRD_ROW_COUNT];

export const TierBenefitsCard: FC<Props> = ({ card }) => {
  const IconComponent = card.icon;
  const bgIcons = Array(BG_ICONS_COUNT).fill(card.bgIcon);
  const rowScheme = ROW_SCHEME;

  return (
    <div className={styles.card}>
      <div className={styles.backgroundIcons}>
        {
          rowScheme.reduce<{ row: JSX.Element[]; index: number }>(
            (accumulator, iconsInRow) => {
              const rowIcons = bgIcons.slice(accumulator.index, accumulator.index + iconsInRow);
              const rowElement = (
                <div key={accumulator.index} className={styles.row}>
                  {rowIcons.map((Icon, i) => (
                    <span key={i}>
                      <Icon />
                    </span>
                  ))}
                </div>
              );

              const newAccumulator = {
                row: [...accumulator.row, rowElement],
                index: accumulator.index + iconsInRow,
              };

              return newAccumulator;
            },
            { row: [], index: 0 },
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
        {card.cardList.map(item => {
          return (
            <li key={item.id} className={`${item.isActive ? styles.active : ''}`}>
              {item.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
