import { type FC, type SyntheticEvent } from 'react';

interface CryptoIconProps {
  url: string;
  alt: string;
  className?: string;
}

// Компонент для отображения иконки криптовалюты из URL
export const CryptoIcon: FC<CryptoIconProps> = ({ url, alt, className }) => {
  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.currentTarget;

    target.style.display = 'none';
  };

  return <img src={url} alt={alt} className={className} loading="lazy" onError={handleError} />;
};
