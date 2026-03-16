import { FC, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { isEmailValid } from '@shared/lib/validation/email';
import { Button, Input } from '@shared/ui';
import { MailIcon } from '@shared/ui/icons';

import { FooterSupport } from '@widgets/footer/FooterSupport/FooterSupport';

import styles from './RecoveryPassword.module.scss';

export interface RecoveryPasswordProps {
  className?: string;
  onSuccess: () => void;
}

interface RecoveryFormValues {
  email: string;
}

export const RecoveryPassword: FC<RecoveryPasswordProps> = ({ onSuccess }) => {
  const { t } = useTranslation('loginModal');

  const recoverySchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, t('emailRequired', 'Введите email'))
          .refine(isEmailValid, t('emailInvalid', 'Некорректный формат email')),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RecoveryFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: RecoveryFormValues): void => {
    void data;
    onSuccess();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span className={styles.subTitle}>{t('recoverySubtitle')}</span>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <Input
            icon={<MailIcon />}
            placeholder={t('recoveryPlaceholder')}
            type="email"
            autoComplete="email"
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
          <Button type={'submit'} variant={'primary'} fullWidth={true} disabled={isSubmitting || !isValid}>
            {t('recoverySubmit')}
          </Button>
        </form>
      </div>
      <FooterSupport className={styles.footer} />
    </div>
  );
};
