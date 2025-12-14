import { Button } from "@shared/ui/button";
import { ReactComponent as SupportIcon } from "@assets/icons/support.svg";
import type { FC } from "react";
import "./FooterSupport.scss";

interface Props {
  className?: string;
}

export const FooterSupport: FC<Props> = ({className}) => {
  return (
    <div className={`footer-support ${className ?? ""}`}>
      <h3>
        Тех. поддержка <span className="footer-support-time">24/7</span>
      </h3>
      <Button size="s" icon={SupportIcon} variant="secondary">
        Написать
      </Button>
    </div>
  );
};
