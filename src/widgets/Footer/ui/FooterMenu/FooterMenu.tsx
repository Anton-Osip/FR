import type { FC } from "react";
import "./FooterMenu.scss";

interface FooterMenuItem {
    title: string
    links: {
        text: string,
        url: string
    }[]
}

interface Props {
  items: FooterMenuItem[];
  className?: string;
}

export const FooterMenu: FC<Props> = ({ items, className }) => {
  return (
    <div className={`footer-menu ${className ?? ""}`}>
      {items.map((item) => (
        <div className="footer-column" key={item.title}>
          <h4 className="footer-column-title">{item.title}</h4>
          <ul className="footer-links">
            {item.links.map((link) => (
              <li key={link.text}>
                <a href={link.url}>{link.text}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
