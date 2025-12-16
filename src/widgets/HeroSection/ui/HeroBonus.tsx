import {Button} from "@shared/ui";
import bonusImage from "@assets/icons/500.svg?url";
import animation from "@assets/images/hero-bonus.png";
import useEmblaCarousel from "embla-carousel-react";
import {useEffect, useMemo, useState} from "react";
import styles from "../HeroBonus.module.scss";

export const HeroBonus = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "start",
    });

    const slides = [1, 2, 3, 4];
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

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        onSelect();
        emblaApi.on("select", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi]);

    return (
        <div className={styles.heroBonusCarousel}>
            <div className={styles.heroBonusViewport} ref={emblaRef}>
                <div className={styles.heroBonusContainer}>
                    {slides.map((slide) => (
                        <div className={styles.heroBonusSlide} key={slide}>
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
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.heroBonusPagination}>
                {dotsBefore.map((idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={styles.heroBonusDot}
                        onClick={() => emblaApi?.scrollTo(idx)}
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
                            onClick={() => emblaApi?.scrollTo(targetIndex)}
                            aria-label={`Слайд ${targetIndex + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};




