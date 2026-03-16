import type { FC, ReactNode } from 'react';

import clsx from 'clsx';

import s from './DropdownApp.module.scss';

type Props = {
  title: ReactNode | string;
  onSelect?: () => void;
  active?: boolean;
  className?: string;
};

export const DropdownItem: FC<Props> = ({ title, onSelect, active = false, className }) => {
  return (
    <button className={clsx(s.option, active && s.optionActive, className)} type="button" onClick={onSelect}>
      <span className={s.optionContent}>
        <span className={s.optionRadio} aria-hidden="true" />
        <span className={s.optionLabel}>{title}</span>
      </span>
    </button>
  );
};
