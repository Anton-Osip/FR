import { Button } from "@shared/ui/button";
import bonusImage from "@assets/icons/500.svg?url";
import styles from "../HeroSection.module.scss";

export const HeroSection = () => {
  return (
    <div className={styles["hero"]}>
      <div className={styles["hero-bonus"]}>
        <h3>
          Бонус до
          <br /> на первый депозит
        </h3>
        <img
          src={bonusImage}
          alt="500"
          className={styles["hero-bonus-number"]}
        />
        <Button className={styles["hero-bonus-button"]}>Подробнее</Button>
      </div>
      <div className={styles["hero-slot"]}>
        <h3>Слот недели</h3>
      </div>
      <div className={styles["hero-cashback"]}>
        <h3>Кэшбек по средам</h3>
      </div>
    </div>
  );
};
