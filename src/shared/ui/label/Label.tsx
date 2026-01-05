import React, { type FC, type ReactNode } from 'react';

import clsx from 'clsx';

import './Label.scss';

interface LabelProps {
  children: React.ReactNode;
  icon?: ReactNode;
  active?: boolean;
}

export const Label: FC<LabelProps> = ({ icon, children, active = false }) => {
  return (
    <div className={clsx('label', active && 'active')}>
      {icon && <span className="labelIcon">{icon}</span>}
      {children}
    </div>
  );
};
