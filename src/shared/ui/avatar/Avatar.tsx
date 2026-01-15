import { type FC } from 'react';

import * as RadixAvatar from '@radix-ui/react-avatar';
import clsx from 'clsx';

import styles from './Avatar.module.scss';

interface Props {
  avatar?: string | null | undefined;
  name?: string | null | undefined;
  userFirstname?: string | null | undefined;
  className?: string;
}

export const Avatar: FC<Props> = ({ avatar, className }) => {
  const avatarData = {
    src: avatar || '',
    alt: 'avatar',
  };

  return (
    <RadixAvatar.Root className={clsx(styles.avatarRoot, className)}>
      <RadixAvatar.Image className={styles.avatarImage} src={avatarData.src} alt={avatarData.alt} />
      <RadixAvatar.Fallback className={styles.avatarFallback} delayMs={600}></RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
};
