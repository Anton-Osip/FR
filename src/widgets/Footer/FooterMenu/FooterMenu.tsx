import { useEffect, useState, type FC } from 'react';

import styles from './FooterMenu.module.scss';

interface FooterMenuItem {
  title: string;
  links: {
    text: string;
    url: string;
    shortText?: string;
  }[];
}

interface Props {
  items: FooterMenuItem[];
  className?: string;
}

export const FooterMenu: FC<Props> = ({ items, className }) => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  const MOBILE_BREAKPOINT = 1200;

  useEffect(() => {
    const handleResize = (): void => setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatLinkText = (text: string, shortText?: string): string => {
    if (shortText && windowWidth <= MOBILE_BREAKPOINT) {
      return shortText;
    }

    return text;
  };

  return (
    <div className={`${styles['footer-menu']} ${className ? styles[className] : ''}`}>
      {items.map(item => (
        <div className={styles['footer-column']} key={item.title}>
          <h4 className={styles['footer-column-title']}>{item.title}</h4>
          <ul className={styles['footer-links']}>
            {item.links.map(link => (
              <li key={link.text}>
                <a href={link.url}>{formatLinkText(link.text, link.shortText)}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
