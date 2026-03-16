import { type FC } from 'react';

import * as RadixAvatar from '@radix-ui/react-avatar';
import clsx from 'clsx';

import anonAvatar from '@shared/assets/images/anon_avatar.webp';
import { handleImageError } from '@shared/lib';

import styles from './Avatar.module.scss';

interface Props {
  avatar?: string | null | undefined;
  className?: string;
}

export const Avatar: FC<Props> = ({ avatar, className }) => {
  return (
    <RadixAvatar.Root className={clsx(styles.avatarRoot, className)}>
      <RadixAvatar.Image
        className={styles.avatarImage}
        src={avatar || undefined}
        alt="avatar"
        loading="lazy"
        onError={handleImageError}
      />
      <RadixAvatar.Fallback className={styles.avatarFallback} delayMs={0}>
        <img src={anonAvatar} alt="avatar" className={styles.avatarFallbackImage} />
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
};
