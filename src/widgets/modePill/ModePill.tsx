import { FC } from 'react';

import { AppMode } from '@shared/schemas';

export const ModePill: FC<{ mode: AppMode }> = ({ mode }) => {
  return <div>{mode === 'webapp' ? 'Telegram WebApp' : mode === 'site' ? 'Сайт' : 'Не определено'}</div>;
};
