import { Carousel } from "@widgets/Carousel";
import { carouselData } from "../constants/constants";
import { HeroSection } from "@widgets/HeroSection";
import styles from "../HomePage.module.scss";

export const HomePage = () => {
  return (
    <>
      <HeroSection />
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
