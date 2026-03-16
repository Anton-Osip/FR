import { FC } from 'react';

import clsx from 'clsx';
import Lottie from 'lottie-react';

import chipAnimation from '@shared/assets/animations/chip.json';
import logoAnimation from '@shared/assets/animations/logo.json';

import s from './Preloader.module.scss';

interface Props {
  className?: string;
}

export const Preloader: FC<Props> = ({ className }) => {
  return (
    <div className={clsx(s.preloader, className)}>
      <Lottie animationData={logoAnimation} className={s.logoAnimation} loop={true} />
      <Lottie animationData={chipAnimation} className={s.chipAnimation} loop={true} />
    </div>
  );
};
