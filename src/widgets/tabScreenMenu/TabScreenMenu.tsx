import type { FC } from "react";
import { useState, useMemo } from "react";
import { TAB_MENU_DATA } from "./constants/constants";
import { TabMenuItem } from "./tabMenuItem";
import styles from "./TabScreenMenu.module.scss";

interface Props {
  className?: string;
}

export const TabScreenMenu: FC<Props> = ({ className }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const eclipseLeft = useMemo(() => {
    if (!TAB_MENU_DATA.length) return "50%";
    const itemWidth = 100 / TAB_MENU_DATA.length;
    const centerPercent = itemWidth * activeIndex + itemWidth / 2;
    // 46px ширина SVG, смещаем на половину
    return `calc(${centerPercent}% - 23px)`;
  }, [activeIndex]);

  return (
    <div className={`${styles.tabMenu} ${className || ""}`}>
      <div className={styles.container}>
        <div className={styles.eclipse} style={{ left: eclipseLeft }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="46"
            height="10"
            viewBox="0 0 46 10"
            fill="none"
          >
            <path
              d="M38.9501 6.61166C34.6218 2.4826 29.0631 0 23 0C16.9369 0 11.3782 2.4826 7.04995 6.61166C4.99662 8.57047 2.58298 10 0 10H46C43.417 10 41.0034 8.57047 38.9501 6.61166Z"
              fill="#131824"
            />
          </svg>
        </div>
        {TAB_MENU_DATA.map((item, index) => (
          <TabMenuItem
            key={item.id}
            title={item.title}
            icon={item.icon}
            isActive={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
