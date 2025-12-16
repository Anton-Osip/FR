import styles from "../HeroSlot.module.scss";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useState } from "react";

export const HeroSlot = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });

  const slides = [1, 2, 3, 4];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const dotsBefore = useMemo(
    () => Array.from({ length: selectedIndex }, (_, idx) => idx),
    [selectedIndex],
  );

  const dotsAfter = useMemo(
    () =>
      Array.from(
        { length: slides.length - selectedIndex - 1 },
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

  const slotImage = "/src/assets/images/hero-slot.png";

  return (
    <div className={styles.slotCarousel}>
      <div className={styles.slotViewport} ref={emblaRef}>
        <div className={styles.slotContainer}>
          {slides.map((slide) => (
            <div className={styles.slotSlide} key={slide}>
              <div className={styles.heroSlot}>
                <h3 className={styles.slotTitle}>Слот недели</h3>

                <div className={styles.slotCardWrapper}>
                  <img src={slotImage} alt="Слот недели" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.slotPagination}>
        {dotsBefore.map((idx) => (
          <button
            key={idx}
            type="button"
            className={styles.slotDot}
            onClick={() => emblaApi?.scrollTo(idx)}
            aria-label={`Слайд ${idx + 1}`}
          />
        ))}

        <div className={styles.slotPaginationBar} />

        {dotsAfter.map((targetIndex) => (
          <button
            key={targetIndex}
            type="button"
            className={styles.slotDot}
            onClick={() => emblaApi?.scrollTo(targetIndex)}
            aria-label={`Слайд ${targetIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
};



