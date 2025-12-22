import { useEffect, useState, type FC } from 'react';

import styles from './FooterMenu.module.scss';

interface FooterMenuItem {
  title: string;
  links: {
    text: string;
    url: string;
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

  const formatLinkText = (text: string): string => {
    if (text.startsWith('Партнерская') && windowWidth <= MOBILE_BREAKPOINT) {
      return text.replace('Партнерская', 'Партнер.');
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
                <a href={link.url}>{formatLinkText(link.text)}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
