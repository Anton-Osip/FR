import {carouselData} from "../constants/constants";
import {HeroSection} from "@widgets/HeroSection";
import styles from "../HomePage.module.scss";
import {BettingTable} from "@widgets/bettingTable";
import {TABLE_DATA} from "@widgets/bettingTable/mockTable.tsx";
import {Carousel} from "@widgets/Carousel/ui/Carousel.tsx";
import {CategoryFiltersBar} from "@widgets/categoryFiltersBar";


export const HomePage = () => {
    return (
        <>

            <div className={styles["main-carousel-section"]}>
                <HeroSection/>
                <CategoryFiltersBar/>
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
                <BettingTable items={TABLE_DATA}/>
            </div>
        </>
    );
};
