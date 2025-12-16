import type { FC } from "react";
import { TAB_MENU_DATA } from "./constants/constants";
import { TabMenuItem } from "./tabMenuItem";
import styles from "./TabScreenMenu.module.scss";

interface Props {
  className?: string;
}

export const TabScreenMenu: FC<Props> = ({ className }) => {
  return (
    <div className={`${styles.tabMenu} ${className || ""}`}>
      {TAB_MENU_DATA.map((item) => {
        return (
          <TabMenuItem key={item.id} title={item.title} icon={item.icon} />
        );
      })}
    </div>
  );
};
