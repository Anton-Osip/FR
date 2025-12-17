import { Button } from "@shared/ui";
import { type FC } from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import * as Progress from "@radix-ui/react-progress";
import { SilverIcon } from "@shared/ui/icons";
import { GoldIcon } from "@shared/ui/icons";

import styles from "./UserAmountProgress.module.scss";

interface Props {
  amount: string;
}

export const UserAmountProgress: FC<Props> = ({ amount }) => {
  const maxAmountinK = 100;
  const progressPercent = (parseFloat(amount) / maxAmountinK) * 100;

  return (
    <div className={styles.userAmountBlock}>
      <div className={styles.amountWrap}>
        <p>
          {amount}K ₽ / {maxAmountinK}K ₽
        </p>
        <Button className={styles.amountButton} variant="ghost">
          Подробнее <ChevronRightIcon />
        </Button>
      </div>
      <Progress.Root className={styles.progress} value={progressPercent}>
        <Progress.Indicator
          className={styles.progressIndicator}
          style={{ transform: `translateX(-${100 - progressPercent}%)` }}
        />
      </Progress.Root>
      <div className={styles.moneyWrap}>
        <div className={styles.moneyItemWrap}>
          <SilverIcon />
          <p>Серебро</p>
        </div>
        <div className={styles.moneyItemWrap}> 
          <GoldIcon />
          <p>Золото</p>
        </div>
      </div>
    </div>
  );
};
