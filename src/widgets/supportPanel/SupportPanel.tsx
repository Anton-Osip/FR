import { type FC, useMemo } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';
import { ChevronHeaderIcon } from '@shared/ui/icons';

import styles from './SupportPanel.module.scss';

import { useGetLinksResolveQuery } from '@features/links';

interface SupportPanelProps {
  className?: string;
}

export const SupportPanel: FC<SupportPanelProps> = ({ className }) => {
  const { t } = useTranslation('profile');

  const { data: linksResolve } = useGetLinksResolveQuery({});

  const buttons = useMemo(
    () => [
      {
        id: 'news',
        label: t('supportPanel.news'),
        link: String(linksResolve?.links?.news),
      },
      {
        id: 'chat',
        label: t('supportPanel.chat'),
        link: String(linksResolve?.links?.user_chat),
      },
      {
        id: 'agreement',
        label: t('supportPanel.agreement'),
        link: String(linksResolve?.links?.terms),
      },
      {
        id: 'support',
        label: t('supportPanel.support'),
        link: String(linksResolve?.links?.support),
      },
    ],
    [
      linksResolve?.links?.news,
      linksResolve?.links?.support,
      linksResolve?.links?.terms,
      linksResolve?.links?.user_chat,
      t,
    ],
  );

  return (
    <div className={clsx(styles.supportPanel, className)}>
      {buttons.map(button => (
        <Button
          key={button.id}
          size={'s'}
          variant={'tertiary'}
          className={styles.button}
          onClick={() => window.open(button.link, '_blank')}
        >
          <span className={styles.buttonContainer}>
            <span className={styles.buttonLabel}>{button.label}</span>
            <span className={styles.buttonChevron}>
              <ChevronHeaderIcon />
            </span>
          </span>
        </Button>
      ))}
    </div>
  );
};
