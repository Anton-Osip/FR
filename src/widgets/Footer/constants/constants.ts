import SbpIcon from '@assets/icons/bank1.svg?url';
import SberIcon from '@assets/icons/bank3.svg?url';
import TetherIcon from '@assets/icons/crypto2.svg?url';
import BitcoinIcon from '@assets/icons/crypto3.svg?url';
import VechainIcon from '@assets/images/crypto1.png';
import TbankIcon from '@assets/images/tbank.png';

export interface BankItem {
  id: string;
  label: string;
  image: string;
  gradient?: string;
}

interface FooterMenuItem {
  title: string;
  links: {
    text: string;
    url: string;
    shortText?: string;
  }[];
}

export const getFooterMenu = (t: (key: string) => string): FooterMenuItem[] => [
  {
    title: t('menu.support.title'),
    links: [
      {
        text: t('menu.support.techSupport'),
        url: '/',
      },
      {
        text: t('menu.support.security'),
        url: '/',
      },
      {
        text: t('menu.support.affiliateProgram'),
        url: '/',
        shortText: t('menu.support.affiliateProgramShort'),
      },
    ],
  },
  {
    title: t('menu.loyalty.title'),
    links: [
      {
        text: t('menu.loyalty.invite'),
        url: '/',
      },
      {
        text: t('menu.loyalty.affiliateSupport'),
        url: '/',
        shortText: t('menu.loyalty.affiliateSupportShort'),
      },
      {
        text: t('menu.loyalty.bonuses'),
        url: '/',
      },
    ],
  },
  {
    title: t('menu.casino.title'),
    links: [
      {
        text: t('menu.casino.games'),
        url: '/',
      },
      {
        text: t('menu.casino.liveGames'),
        url: '/',
      },
      {
        text: t('menu.casino.slots'),
        url: '/',
      },
    ],
  },
  {
    title: t('menu.rulesAndBonuses.title'),
    links: [
      {
        text: t('menu.rulesAndBonuses.rankSystem'),
        url: '/',
      },
      {
        text: t('menu.rulesAndBonuses.promotions'),
        url: '/',
      },
      {
        text: t('menu.rulesAndBonuses.cashback'),
        url: '/',
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
