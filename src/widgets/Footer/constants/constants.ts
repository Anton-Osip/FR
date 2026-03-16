import SbpIcon from '@shared/assets/icons/bank1.svg?url';
import SberIcon from '@shared/assets/icons/bank3.svg?url';
import TetherIcon from '@shared/assets/icons/crypto2.svg?url';
import BitcoinIcon from '@shared/assets/icons/crypto3.svg?url';
import VechainIcon from '@shared/assets/images/crypto1.webp';
import TbankIcon from '@shared/assets/images/tbank.webp';
import { APP_PATH } from '@shared/config';

export interface BankItem {
  id: string;
  label: string;
  image: string;
  gradient?: string;
}

export interface FooterMenuItem {
  title: string;
  links: {
    text: string;
    onClick: () => void;
    shortText?: string;
  }[];
}

export const getFooterMenu = (
  t: (key: string) => string,
  navigate: (path: string) => void,
  supportLink?: string,
  affiliate?: string,
): FooterMenuItem[] => [
  {
    title: t('menu.support.title'),
    links: [
      {
        text: t('menu.support.techSupport'),
        onClick: () => window.open(supportLink, '_blank'),
      },
      {
        text: t('menu.support.security'),
        onClick: () => window.open(supportLink, '_blank'),
      },
      {
        text: t('menu.support.affiliateProgram'),
        onClick: () => window.open(affiliate, '_blank'),
        shortText: t('menu.support.affiliateProgramShort'),
      },
    ],
  },
  {
    title: t('menu.loyalty.title'),
    links: [
      {
        text: t('menu.loyalty.invite'),
        onClick: () => {
          navigate(APP_PATH.invite);
        },
      },
      {
        text: t('menu.loyalty.affiliateSupport'),
        onClick: () => window.open(affiliate, '_blank'),
        shortText: t('menu.loyalty.affiliateSupportShort'),
      },
      {
        text: t('menu.loyalty.bonuses'),
        onClick: () => {
          navigate(APP_PATH.bonuses);
        },
      },
    ],
  },
  {
    title: t('menu.casino.title'),
    links: [
      {
        text: t('menu.casino.games'),
        onClick: () => {
          navigate(APP_PATH.slots.replace(':type', 'allGames'));
        },
      },
      {
        text: t('menu.casino.liveGames'),
        onClick: () => {
          navigate(APP_PATH.slots.replace(':type', 'liveGames'));
        },
      },
      {
        text: t('menu.casino.slots'),
        onClick: () => {
          navigate(APP_PATH.slots.replace(':type', 'allGames'));
        },
      },
    ],
  },
  {
    title: t('menu.rulesAndBonuses.title'),
    links: [
      {
        text: t('menu.rulesAndBonuses.rankSystem'),
        onClick: () => window.open(supportLink, '_blank'),
      },
      {
        text: t('menu.rulesAndBonuses.promotions'),
        onClick: () => navigate(APP_PATH.bonuses),
      },
      {
        text: t('menu.rulesAndBonuses.cashback'),
        onClick: () => navigate(APP_PATH.bonuses),
      },
    ],
  },
];

export const getFooterBanking = (): BankItem[] => [
  {
    id: 'sbp',
    label: 'sbp',
    image: SbpIcon,
    gradient: 'linear-gradient(135deg, #F0F5FF, #F0F5FF)',
  },
  {
    id: 'tbank',
    label: 'tbank',
    image: TbankIcon,
  },
  {
    id: 'sber',
    label: 'sber',
    image: SberIcon,
    gradient: 'linear-gradient(135deg, #F2EB00, #1EDB08, #00A8F2)',
  },
];

export const getFooterCrypto = (): BankItem[] => [
  {
    id: 'vechain',
    label: 'vechain',
    image: VechainIcon,
  },
  {
    id: 'tether',
    label: 'tether',
    image: TetherIcon,
    gradient: 'linear-gradient(135deg, #26A17B, #26A17B)',
  },
  {
    id: 'bitcoin',
    label: 'bitcoin',
    image: BitcoinIcon,
    gradient: 'linear-gradient(135deg, #F7931A, #F7931A)',
  },
];
