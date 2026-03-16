import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import type { WalletWithdrawEligibilityResponse } from '../../../model';

import styles from './WithdrawalEligibilityErrors.module.scss';

export interface WithdrawalEligibilityErrorsProps {
  eligibilityData?: WalletWithdrawEligibilityResponse;
}

/**
 * Компонент для отображения ошибок eligibility при выводе средств
 */
export const WithdrawalEligibilityErrors: FC<WithdrawalEligibilityErrorsProps> = ({ eligibilityData }) => {
  const { t } = useTranslation('walletModal');

  if (!eligibilityData) {
    return null;
  }

  // Функция для получения текста ошибки по reason
  const getReasonErrorMessage = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      insufficient_wager: t('withdrawalErrors.insufficientWager'),
      amount_out_of_bounds: t('withdrawalErrors.amountOutOfBounds'),
      method_not_found: t('withdrawalErrors.methodNotFound'),
      method_disabled: t('withdrawalErrors.methodDisabled'),
    };

    return reasonMap[reason] || t('withdrawalErrors.withdrawalUnavailable');
  };

  return (
    <>
      {eligibilityData.missing_fields && eligibilityData.missing_fields.length > 0 && (
        <p className={styles.errorMessage}>
          {t('withdrawalErrors.missingFields', {
            fields: eligibilityData.missing_fields.join(', '),
          })}
        </p>
      )}

      {eligibilityData.invalid_fields && eligibilityData.invalid_fields.length > 0 && (
        <p className={styles.errorMessage}>
          {t('withdrawalErrors.invalidFields', {
            fields: eligibilityData.invalid_fields.join(', '),
          })}
        </p>
      )}

      {eligibilityData.reason && eligibilityData.reason !== 'invalid_input' && (
        <p className={styles.errorMessage}>{getReasonErrorMessage(eligibilityData.reason)}</p>
      )}
    </>
  );
};
