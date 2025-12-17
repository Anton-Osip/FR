import type { FC } from "react";
import { WalletIcon } from "@shared/ui/icons/WalletIcon";
import { BonusIcon } from "@shared/ui/icons/BonusIcon";
import { formatRubles } from "@shared/utils/formatRubles";
import styles from "./UserBalance.module.scss";
import { Button } from "@shared/ui";

interface Props {
  isMain: boolean;
  amount: number;
}

export const UserBalance: FC<Props> = ({ isMain, amount }) => {
  const formattedAmount = formatRubles(amount);
  const text = isMain ? "Основной баланс" : "Бонусный баланс";
  const buttonText = isMain ? "Пополнить" : "Бонусы";
  const buttonVariant = isMain ? "primary" : "tertiary";
  const buttonIcon = isMain ? <WalletIcon /> : <BonusIcon />;
  const classNameValue = isMain ? "mainBalance" : "bonusBalance";

  return (
    <div className={`${styles.balance} ${classNameValue}`}>
      <p className={styles.amount}>{formattedAmount}</p>
      <p className={styles.text}>{text}</p>
      <Button
        className={styles.balanceButton}
        variant={buttonVariant}
        icon={buttonIcon}
      >
        {buttonText}
      </Button>
    </div>
  );
};
