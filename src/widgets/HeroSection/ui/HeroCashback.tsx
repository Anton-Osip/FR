import styles from "../HeroCashback.module.scss";
import {useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay} from "swiper/modules";
import type SwiperType from "swiper";
import slotImage from "/src/assets/images/hero-cashback.png";

// @ts-expect-error - Swiper CSS imports
import "swiper/css";
// @ts-expect-error - Swiper CSS imports
import "swiper/css/autoplay";

export const HeroCashback = () => {
    const slides = [1, 2, 3, 4];
    const [activeIndex, setActiveIndex] = useState(0);

    const handleSlideChange = (swiper: SwiperType) => {
        setActiveIndex(swiper.realIndex);
    };

    const renderCustomPagination = () => {
        return (
            <div className={styles.cashbackPagination}>
                {slides.map((idx, index) => (
                    <div
                        key={idx}
                        className={`${styles.cashbackDot} ${activeIndex === index ? styles.activeDote : ''}`}
                        aria-label={`Слайд ${idx + 1}`}
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
                speed={800}
                autoplay={{
                    delay: 5000,
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







