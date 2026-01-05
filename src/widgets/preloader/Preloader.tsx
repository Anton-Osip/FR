import { FC } from 'react';

import Lottie from 'lottie-react';

import chipAnimation from '@shared/assets/animations/chip.json';
import logoAnimation from '@shared/assets/animations/logo.json';

import s from './Preloader.module.scss';

export const Preloader: FC = () => {
  return (
    <div className={s.preloader}>
      <Lottie animationData={logoAnimation} className={s.logoAnimation} loop={true} />
      <Lottie animationData={chipAnimation} className={s.chipAnimation} loop={true} />
    </div>
  );
};
