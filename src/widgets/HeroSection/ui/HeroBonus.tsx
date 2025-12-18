import {Button} from "@shared/ui";
import bonusImage from "@assets/icons/500.svg?url";
import animation from "@assets/images/hero-bonus.png";
import {Swiper, SwiperSlide} from "swiper/react";
import type {Swiper as SwiperType} from "swiper";
import {useMemo, useState} from "react";
import styles from "../HeroBonus.module.scss";

export const HeroBonus = () => {
    const slides = [1, 2, 3, 4];
    const [swiper, setSwiper] = useState<SwiperType | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const dotsBefore = useMemo(
        () => Array.from({length: selectedIndex}, (_, idx) => idx),
        [selectedIndex],
    );
    const dotsAfter = useMemo(
        () =>
            Array.from(
                {length: slides.length - selectedIndex - 1},
                (_, idx) => idx + selectedIndex + 1,
            ),
        [slides.length, selectedIndex],
    );

    return (
        <div className={styles.heroBonusCarousel}>
            <div className={styles.heroBonusViewport}>
                <Swiper
                    className={styles.heroBonusContainer}
                    loop
                    slidesPerView={1}
                    spaceBetween={16}
                    onSwiper={setSwiper}
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

            <div className={styles.heroBonusPagination}>
                {dotsBefore.map((idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={styles.heroBonusDot}
                        onClick={() => swiper?.slideToLoop(idx)}
                        aria-label={`Слайд ${idx + 1}`}
                    />
                ))}

                <div className={styles.heroBonusPaginationTrack}>
                </div>

                <div className={styles.heroBonusPaginationDots}>
                    {dotsAfter.map((targetIndex) => (
                        <button
                            key={targetIndex}
                            type="button"
                            className={styles.heroBonusDot}
                            onClick={() => swiper?.slideToLoop(targetIndex)}
                            aria-label={`Слайд ${targetIndex + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};




