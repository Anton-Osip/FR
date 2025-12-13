import type { FC } from "react";
import "./FooterMoneyItem.scss";

interface BankItem {
  id: string;
  img: string;
}

interface Props {
  text: string;
  items: BankItem[];
}

export const FooterMoneyItem: FC<Props> = ({ text, items }) => {
  return (
    <div className="footer-money-item">
      <span>{text}</span>
      <div className="footer-money-item-wrap">
        {items.map((item) => {
          return <div className="footer-money-item-circle" key={item.id} />;
        })}
      </div>
    </div>
  );
};
