import { FC } from 'react';

import Lottie from 'lottie-react';

import chipAnimation from '../../assets/anomation/chip.json';
import logoAnimation from '../../assets/anomation/logo.json';

import s from './Preloader.module.scss';

export const Preloader: FC = () => {
  return (
    <div className={s.preloader}>
      <Lottie animationData={logoAnimation} className={s.logoAnimation} loop={true} />
      <Lottie animationData={chipAnimation} className={s.chipAnimation} loop={true} />
    </div>
  );
};
