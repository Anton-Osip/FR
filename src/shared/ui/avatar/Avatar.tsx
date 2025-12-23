import { type FC } from 'react';

import * as RadixAvatar from '@radix-ui/react-avatar';

import styles from './Avatar.module.scss';

interface Props {
  avatar: string | null | undefined;
  name: string | null | undefined;
  userFirstname: string | null | undefined;
}

export const Avatar: FC<Props> = ({ avatar }) => {
  const avatarData = {
    src: avatar || '',
    alt: 'avatar',
  };

  return (
    <RadixAvatar.Root className={styles.avatarRoot}>
      <RadixAvatar.Image className={styles.avatarImage} src={avatarData.src} alt={avatarData.alt} />
      <RadixAvatar.Fallback className={styles.avatarFallback} delayMs={600}></RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
};
