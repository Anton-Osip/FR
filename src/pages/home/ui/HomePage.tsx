import { Carousel } from "@widgets/Carousel";
import { carouselData } from "../constants/constants";
import { HeroSection } from "@widgets/HeroSection";
import styles from "../HomePage.module.scss";
import {BettingTable} from "@widgets/bettingTable";
import {TABLE_DATA} from "@widgets/bettingTable/mockTable.tsx";



export const HomePage = () => {
  return (
    <>
      <HeroSection />
        <BettingTable items={TABLE_DATA}/>
      <div className={styles["main-carousel-section"]}>
        {carouselData.map((item) => {
          return (
            <Carousel
              key={item.title}
              icon={item.icon}
              title={item.title}
              items={item.items}
            />
          );
        })}
      </div>
    </>
  );
};
