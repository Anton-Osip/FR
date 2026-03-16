import type { FC } from 'react';

import { BankItem } from '../constants/constants.ts';

import styles from './FooterMoneyItem.module.scss';

interface Props {
  text: string;
  items: BankItem[];
}

export const FooterMoneyItem: FC<Props> = ({ text, items }) => {
  return (
    <div className={styles.footerMoneyItem}>
      <span>{text}</span>
      <div className={styles.footerMoneyItemWrap}>
        {items.map(item => {
          return (
            <div key={item.id} className={styles.footerMoneyItemCircle} title={item.label}>
              {item.gradient && <div className={styles.circleGradient} style={{ background: item.gradient }} />}
              <img src={item.image} alt={item.label} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
