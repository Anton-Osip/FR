import styles from "../HeroSlot.module.scss";
import {useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay} from "swiper/modules";
import type SwiperType from "swiper";
import slotImage from "/src/assets/images/hero-slot.png";
// @ts-expect-error - Swiper CSS imports
import "swiper/css";
// @ts-expect-error - Swiper CSS imports
import "swiper/css/autoplay";

export const HeroSlot = () => {
    const slides = [1];
    const [activeIndex, setActiveIndex] = useState(0);

    const handleSlideChange = (swiper: SwiperType) => {
        setActiveIndex(swiper.realIndex);
    };

    const renderCustomPagination = () => {
        const dotsBefore = Array.from({length: activeIndex}, (_, idx) => idx);
        const dotsAfter = Array.from(
            {length: slides.length - activeIndex - 1},
            (_, idx) => idx + activeIndex + 1,
        );

        return (
            <div className={styles.slotPagination}>
                {dotsBefore.map((idx) => (
                    <div
                        key={idx}
                        className={styles.slotDot}
                        aria-label={`Слайд ${idx + 1}`}
                    />
                ))}

                <div className={styles.slotPaginationBar}/>

                {dotsAfter.map((targetIndex) => (
                    <div
                        key={targetIndex}
                        className={styles.slotDot}
                        aria-label={`Слайд ${targetIndex + 1}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className={styles.slotCarousel}>
            <Swiper
                modules={[Autoplay]}
                loop={slides.length>3}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                    waitForTransition: true,
                }}
                allowTouchMove={false}
                onSlideChange={handleSlideChange}
                className={styles.slotViewport}
                slidesPerView={1}
                spaceBetween={16}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide} className={styles.slotSlide}>
                        <div className={styles.heroSlot}>
                            <h3 className={styles.slotTitle}>Слот недели</h3>

                            <div className={styles.slotCardWrapper}>
                                <img src={slotImage} alt="Слот недели" draggable={false}/>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {slides.length > 1 && renderCustomPagination()}
        </div>
    );
};



