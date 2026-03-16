import { type CSSProperties, type FC } from 'react';
import { useMemo } from 'react';

import baccara from '@shared/assets/images/slotsImage/baccara.webp';
import blackjack from '@shared/assets/images/slotsImage/blackjack.webp';
import liveGames from '@shared/assets/images/slotsImage/live_games.webp';
import newGames from '@shared/assets/images/slotsImage/new.webp';
import popular from '@shared/assets/images/slotsImage/popular.webp';
import quickGames from '@shared/assets/images/slotsImage/quick_games.webp';
import recommended from '@shared/assets/images/slotsImage/recommended.webp';
import roulette from '@shared/assets/images/slotsImage/roulette.webp';
import allGames from '@shared/assets/images/slotsImage/slotsImg.webp';

import type { SlotsHeaderType } from '@widgets/slotsHeader/constants';

import styles from './SlotsHeroHeader.module.scss';

interface SlotsHeroHeaderProps {
  validType?: SlotsHeaderType;
  title: string;
}

const IMAGE_MAP: Record<SlotsHeaderType, string> = {
  allGames,
  blackjackGames: blackjack,
  popularGames: popular,
  quickGames,
  newGames,
  recommendedGames: recommended,
  rouletteGames: roulette,
  liveGames,
  baccaratGames: baccara,
};

export const SlotsHeroHeader: FC<SlotsHeroHeaderProps> = ({ validType, title }) => {
  const headerType: SlotsHeaderType = validType ?? 'allGames';

  const style = useMemo(() => ({ '--image-url': `url(${IMAGE_MAP[headerType]})` }) as CSSProperties, [headerType]);

  return (
    <header className={styles.header}>
      <div className={styles.container} data-type={headerType} style={style}>
        <h2 className={styles.title}>{title}</h2>
      </div>
    </header>
  );
};
