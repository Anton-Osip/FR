import {Button} from "@shared/ui";
import bonusImage from "@assets/icons/500.svg?url";
import animation from "@assets/images/hero-bonus.png";
import {Swiper, SwiperSlide} from "swiper/react";
import { useState} from "react";
import styles from "../HeroBonus.module.scss";

export const HeroBonus = () => {
    const slides = [1];
    const [selectedIndex, setSelectedIndex] = useState(0);

    const renderCustomPagination = () => {
        return (
            <div className={styles.heroBonusPagination}>
                {slides.map((idx, index) => (
                    <div
                        key={idx}
                        className={`${styles.bonusDot} ${selectedIndex === index ? styles.activeDote : ''}`}
                        aria-label={`Слайд ${idx + 1}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className={styles.heroBonusCarousel}>
            <div className={styles.heroBonusViewport}>
                <Swiper
                    className={styles.heroBonusContainer}
                    slidesPerView={1}
                    speed={800}
                    spaceBetween={16}
                    onSlideChange={(swiperInstance) => setSelectedIndex(swiperInstance.realIndex)}
                >
                    {slides.map((slide) => (
                        <SwiperSlide className={styles.heroBonusSlide} key={slide}>
                            <div className={styles.heroBonus}>
                                <h3 className={styles.title}>
                                    Бонус до
                                    <br/> на первый депозит
                                </h3>
                                <div className={styles.heroBonusNumber}>
                                    <img
                                        src={bonusImage}
                                        alt="500"
                                        className={styles["hero-bonus-number"]}
                                    />
                                </div>
                                <Button className={styles["hero-bonus-button"]}>Подробнее</Button>
                                <div className={styles.bonusAnimation}>
                                    <img src={animation} alt="bonus-animation"/>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            {slides.length > 1 && renderCustomPagination()}


        </div>
    );
};




