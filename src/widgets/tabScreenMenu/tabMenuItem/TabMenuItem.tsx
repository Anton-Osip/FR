import type { FC, SVGProps } from "react";
import styles from "./TabMenuItem.module.scss";

interface Props {
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}

export const TabMenuItem: FC<Props> = ({ title, icon: Icon, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      (onClick || (() => {}))();
    }
  };

  return (
    <div
      className={styles.tabMenuItem}
      onClick={onClick || (() => {})}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Icon />
      <h3>{title}</h3>
    </div>
  );
};
