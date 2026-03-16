import { type FC, type ReactNode } from 'react';

export interface VisuallyHiddenProps {
  children: ReactNode;
}

export const VisuallyHidden: FC<VisuallyHiddenProps> = ({ children }) => {
  return (
    <span
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
    >
      {children}
    </span>
  );
};

VisuallyHidden.displayName = 'VisuallyHidden';
