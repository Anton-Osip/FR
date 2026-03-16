import { FC, type RefObject, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { getLoginOrigin } from '@shared/config';
import { isEmailValid } from '@shared/lib/validation/email';
import { Button, Input } from '@shared/ui';
import { LockIcon, MailIcon, TgIcon } from '@shared/ui/icons';

import styles from './LoginModal.module.scss';

export interface LoginModalProps {
  className?: string;
  onRecoverPassword: () => void;
  swipeCloseElementRef?: RefObject<HTMLDivElement | null>;
}

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginModal: FC<LoginModalProps> = ({ onRecoverPassword, swipeCloseElementRef }) => {
  const { t } = useTranslation('loginModal');

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, t('emailRequired', 'Введите email'))
          .refine(isEmailValid, t('emailInvalid', 'Некорректный формат email')),
        password: z
          .string()
          .trim()
          .min(
            PASSWORD_MIN_LENGTH,
            t('passwordTooShort', {
              min: PASSWORD_MIN_LENGTH,
              defaultValue: `Пароль должен содержать минимум ${PASSWORD_MIN_LENGTH} символов`,
            }),
          )
          .max(PASSWORD_MAX_LENGTH, t('passwordTooLong', 'Пароль слишком длинный')),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues): void => {
    void data;
    const message = t('invalidCredentials', 'Неверный email или пароль');

    setError('email', { type: 'manual', message });
    setError('password', { type: 'manual', message });
  };

  const goToLogin = (): void => {
    if (typeof window === 'undefined') return;
    const u = new URL(getLoginOrigin() || '');

    u.pathname = '/';
    u.searchParams.set('return_to', window.location.href);
    window.location.assign(u.toString());
  };

  return (
    <>
      <div className={styles.slider} ref={swipeCloseElementRef}></div>
      <div className={styles.content}>
        <h3 className={styles.title}>{t('title')}</h3>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <Input
            icon={<MailIcon />}
            placeholder={t('emailPlaceholder')}
            error={!!errors.email}
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          <Input
            icon={<LockIcon />}
            placeholder={t('passwordPlaceholder')}
            error={!!errors.password}
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {(errors.email || errors.password) && (
            <p className={styles.errorMessage}>{errors.email?.message || errors.password?.message}</p>
          )}
          <Button variant={'ghost'} className={styles.recover} onClick={onRecoverPassword}>
            {t('recoverPassword')}
          </Button>
          <Button type={'submit'} variant={'primary'} fullWidth={true} disabled={isSubmitting || !isValid}>
            {t('loginButton')}
          </Button>
        </form>
      </div>
      <footer className={styles.footer}>
        <div className={styles.lines}>
          <div className={styles.line} />
          <h3 className={styles.footerTitle}>{t('orLoginVia')}</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.lines}>
          <Button variant={'ghost'} className={styles.tgIcon} onClick={() => goToLogin()}>
            <TgIcon />
          </Button>
        </div>
      </footer>
    </>
  );
};
