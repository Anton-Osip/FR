import { FC } from 'react';

import { Notice } from '@shared/ui';

import styles from './SbpConditionsBlock.module.scss';

export const SbpConditionsBlock: FC = () => (
  <div className={styles.container}>
    <h3 className={styles.subtitle}>Помните об условиях платежа</h3>
    <div className={styles.noticeWrapper}>
      <Notice variant={'warning'} text={'Совершайте платеж одной операцией'} />
      <Notice variant={'warning'} text={'Не оставляйте комментарии к переводу'} />
      <Notice variant={'warning'} text={'Реквизиты всегда меняются'} />
    </div>

    <p className={styles.description}>
      Обратите внимание, что в случае перевода неправильной суммы или в другой банк средства могут быть не зачислены.
    </p>
  </div>
);
