import { FC } from 'react';

import type { WalletWithdrawEligibilityResponse } from '../../../model';

import styles from './WithdrawalEligibilityErrors.module.scss';

export interface WithdrawalEligibilityErrorsProps {
  eligibilityData?: WalletWithdrawEligibilityResponse;
}

/**
 * Компонент для отображения ошибок eligibility при выводе средств
 */
export const WithdrawalEligibilityErrors: FC<WithdrawalEligibilityErrorsProps> = ({ eligibilityData }) => {
  if (!eligibilityData) {
    return null;
  }

  return (
    <>
      {eligibilityData.missing_fields && eligibilityData.missing_fields.length > 0 && (
        <p className={styles.errorMessage}>Заполните обязательные поля: {eligibilityData.missing_fields.join(', ')}</p>
      )}
      {eligibilityData.invalid_fields && eligibilityData.invalid_fields.length > 0 && (
        <p className={styles.errorMessage}>Исправьте ошибки в полях: {eligibilityData.invalid_fields.join(', ')}</p>
      )}
      {eligibilityData.reason && eligibilityData.reason !== 'invalid_input' && (
        <p className={styles.errorMessage}>
          {eligibilityData.reason === 'insufficient_wager'
            ? 'Недостаточно средств для вывода'
            : eligibilityData.reason === 'amount_out_of_bounds'
              ? 'Сумма вне допустимых пределов'
              : eligibilityData.reason === 'method_not_found'
                ? 'Метод вывода не найден'
                : eligibilityData.reason === 'method_disabled'
                  ? 'Метод вывода недоступен'
                  : 'Вывод недоступен'}
        </p>
      )}
    </>
  );
};
