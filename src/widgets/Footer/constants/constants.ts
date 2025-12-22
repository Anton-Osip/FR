import type { BankItem } from '../types/types';

import SbpIcon from '@assets/icons/bank1.svg?url';
import SberIcon from '@assets/icons/bank3.svg?url';
import TetherIcon from '@assets/icons/crypto2.svg?url';
import BitcoinIcon from '@assets/icons/crypto3.svg?url';
import VechainIcon from '@assets/images/crypto1.png';
import TbankIcon from '@assets/images/tbank.png';

export const FOOTER_RIGHTS = 'Все права защищены 2025 ©';

export const FOOTER_LTD_TEXT =
  'www.frosty.games принадлежит и управляется компанией Frosty Gaming Ltd, зарегистрированной в соответствии с законодательством Автономного острова Анжуан, регистрационный номер: 15774, юридический адрес: Hamchako, Mutsamudu, Автономный остров Анжуан, Союз Коморских Островов. ' +
  'www.frosty.games лицензирован и регулируется Правительством Автономного острова Анжуан, Союз Коморских Островов, и осуществляет деятельность под лицензией № ALSI-192407050-FI3. ' +
  'www.frosty.games прошел все регуляторные проверки и юридически уполномочен проводить игровые операции для любых азартных игр и ставок.';

export const FOOTER_MENU = [
  {
    title: 'Поддержка',
    links: [
      {
        text: 'Тех. поддержка',
        url: '/',
      },
      {
        text: 'Безопасность',
        url: '/',
      },
      {
        text: 'Партнерская программа',
        url: '/',
      },
    ],
  },
  {
    title: 'Лояльность',
    links: [
      {
        text: 'Инвайт',
        url: '/',
      },
      {
        text: 'Партнерская поддержка',
        url: '/',
      },
      {
        text: 'Бонусы',
        url: '/',
      },
    ],
  },
  {
    title: 'Казино',
    links: [
      {
        text: 'Игры',
        url: '/',
      },
      {
        text: 'Live-игры',
        url: '/',
      },
      {
        text: 'Слоты',
        url: '/',
      },
    ],
  },
  {
    title: 'Правила и бонусы',
    links: [
      {
        text: 'Ранговая система',
        url: '/',
      },
      {
        text: 'Акции',
        url: '/',
      },
      {
        text: 'Кэшбек',
        url: '/',
      },
    ],
  },
];

export const FOOTER_BANKING: BankItem[] = [
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

export const FOOTER_CRYPTO: BankItem[] = [
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
