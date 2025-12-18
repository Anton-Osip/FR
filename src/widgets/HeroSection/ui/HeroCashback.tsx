import styles from "../HeroCashback.module.scss";
import {useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay} from "swiper/modules";
import slotImage from "/src/assets/images/hero-cashback.png";

// @ts-expect-error - Swiper CSS imports
import "swiper/css";
// @ts-expect-error - Swiper CSS imports
import "swiper/css/autoplay";

export const HeroCashback = () => {
    const slides = [1, 2, 3, 4];
    const [activeIndex, setActiveIndex] = useState(0);

    const handleSlideChange = (swiper: any) => {
        setActiveIndex(swiper.realIndex);
    };

    const renderCustomPagination = () => {
        const dotsBefore = Array.from({length: activeIndex}, (_, idx) => idx);
        const dotsAfter = Array.from(
            {length: slides.length - activeIndex - 1},
            (_, idx) => idx + activeIndex + 1,
        );

        return (
            <div className={styles.cashbackPagination}>
                {dotsBefore.map((idx) => (
                    <div
                        key={idx}
                        className={styles.cashbackDot}
                        aria-label={`Слайд ${idx + 1}`}
                    />
                ))}

                <div className={styles.cashbackPaginationBar}/>

                {dotsAfter.map((targetIndex) => (
                    <div
                        key={targetIndex}
                        className={styles.cashbackDot}
                        aria-label={`Слайд ${targetIndex + 1}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className={styles['hero-cashback']}>
            <Swiper
                modules={[Autoplay]}
                loop={true}
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
                    <SwiperSlide key={slide} className={styles.cashbackSlide}>
                        <div className={styles.heroCashback}>
                            <h3 className={styles.cashbackTitle}>Кэшбек <br/>
                                по средам</h3>

                            <div className={styles.cashbackCardWrapper}>
                                <img src={slotImage} alt="Кэшбек по средам" draggable={false}/>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {renderCustomPagination()}
        </div>
    );
};







