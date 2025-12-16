import { HeroBonus } from "./HeroBonus";
import { HeroSlot } from "./HeroSlot";
import { HeroCashback } from "./HeroCashback";
import styles from "../HeroSection.module.scss";

export const HeroSection = () => {
  return (
    <div className={styles["hero"]}>
      <HeroBonus />
      <HeroSlot />
      <HeroCashback />
    </div>
  );
};
