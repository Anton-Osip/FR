import type { FC, ReactNode } from 'react';

import s from './Dropdown.module.scss';

type Props = {
  title: ReactNode | string;
  onSelect?: () => void;
  active?: boolean;
};

export const DropdownItem: FC<Props> = ({ title, onSelect, active = false }) => {
  return (
    <button className={`${s.option} ${active ? s.optionActive : ''}`} type="button" onClick={onSelect}>
      <span className={s.optionContent}>
        <span className={s.optionRadio} aria-hidden="true" />
        <span className={s.optionLabel}>{title}</span>
      </span>
    </button>
  );
};
