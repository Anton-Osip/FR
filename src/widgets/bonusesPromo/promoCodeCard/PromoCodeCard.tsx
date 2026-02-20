import { type FC, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import promoCode from '@shared/assets/icons/promoCodeCardIcon.svg?url';
import { Button, Input } from '@shared/ui';

import { PromoCodeActivatedModal } from '@widgets/bonusesModal/promoCodeActivatedModal';
import { PromoCodeErrorModal } from '@widgets/bonusesModal/promoCodeErrorModal';
import { getErrorMessage } from '@widgets/bonusesModal/promoCodeErrorModal/utils/getErrorMessage';

import styles from './PromoCodeCard.module.scss';

import { useRedeemPromoMutation } from '@/features/bonus/api/bonusApi';
import type { RedeemPromoError } from '@/features/bonus/model/types';

const PROMO_CODE_MAX_LENGTH = 50;

interface PromoCodeCardProps {
  className?: string;
}

interface PromoCodeFormValues {
  code: string;
}

export const PromoCodeCard: FC<PromoCodeCardProps> = ({ className }) => {
  const { t } = useTranslation('bonuses');
  const [redeemPromo, { data: promoResponse, error }] = useRedeemPromoMutation();
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState<boolean>(false);

  const promoError = error as RedeemPromoError | undefined;

  const promoCodeSchema = useMemo(
    () =>
      z.object({
        code: z
          .string()
          .trim()
          .min(1, t('promoCodeCard.required'))
          .max(PROMO_CODE_MAX_LENGTH, t('promoCodeCard.tooLong')),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PromoCodeFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: PromoCodeFormValues): Promise<void> => {
    try {
      await redeemPromo({ code: data.code.trim() }).unwrap();
      setModalIsOpen(true);
      reset();
    } catch (err: unknown) {
      const caughtError = err as RedeemPromoError;

      if (caughtError?.data?.detail) {
        const errorCode =
          typeof caughtError.data.detail === 'string' ? caughtError.data.detail : caughtError.data.detail.code;

        setError('code', { type: 'manual', message: getErrorMessage(errorCode) });
        setErrorModalIsOpen(true);
      }
    }
  };

  return (
    <>
      <div className={clsx(styles.promoCodeCard, className)}>
        <div className={styles.info}>
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>{t('promoCodeCard.title')}</h3>
            <p className={styles.description}>{t('promoCodeCard.description')}</p>
          </div>
          <form className={styles.promocode} onSubmit={handleSubmit(onSubmit)}>
            <Input
              placeholder={t('promoCodeCard.placeholder')}
              size={'m'}
              error={!!errors.code}
              {...register('code')}
            />
            <Button type={'submit'} size={'m'} disabled={isSubmitting || !isValid}>
              {t('promoCodeCard.activate')}
            </Button>
          </form>
        </div>
        <div className={styles.imageWrapper}>
          <img className={styles.image} src={promoCode} alt="promoCode" />
        </div>
      </div>
      {promoResponse && (
        <PromoCodeActivatedModal data={promoResponse} open={modalIsOpen} onOpenChange={setModalIsOpen} />
      )}
      {promoError && (
        <PromoCodeErrorModal open={errorModalIsOpen} onOpenChange={setErrorModalIsOpen} error={promoError} />
      )}
    </>
  );
};
