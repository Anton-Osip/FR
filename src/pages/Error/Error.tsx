import { useErrorPageStore } from '../../shared/stores';
import { Button } from '../../shared/ui/components';
import { BrandLogo } from '../../shared/ui/icons';

import s from './Error.module.css';

export const Error = () => {
  const { title, description, button } = useErrorPageStore();

  return (
    <div className={s.error}>
      <div className={s.icon}>
        <BrandLogo />
      </div>
      <h2 className={s.title}>{title}</h2>
      <p className={s.message}>{description}</p>
      <Button
        onClick={button.onClick}
        variant="dark"
        width="170px"
        height="39px"
        borderRadius={10}
        className={s.telegramButton}
      >
        {typeof button.icon === 'function' ? button.icon() : button.icon}
        {button.label}
      </Button>
    </div>
  );
};
