import { FC, useEffect, useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import styles from './PhoneCountryInput.module.scss';

import { useUserGeoCountry } from '@/entities/user/api/userApi';

export interface PhoneCountryInputProps {
  /** Дополнительный CSS класс */
  className?: string;
  /** Значение номера телефона */
  value?: string;
  /** Обработчик изменения номера телефона */
  onChange?: (phone: string) => void;
  /** Обработчик потери фокуса */
  onBlur?: () => void;
  error?: boolean;
}

export const PhoneCountryInput: FC<PhoneCountryInputProps> = ({
  className,
  value,
  onChange,
  onBlur,
  error = false,
}) => {
  const { t } = useTranslation('walletModal');
  const { data: geoCountry } = useUserGeoCountry();
  const [defaultCountry, setDefaultCountry] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (geoCountry?.country_code) {
      const countryCode = geoCountry.country_code.toLowerCase();

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDefaultCountry(countryCode);
    }
  }, [geoCountry]);

  return (
    <div className={clsx(styles.phoneCountryInput, error && styles.error, className)}>
      <PhoneInput
        placeholder={t('placeholder')}
        searchPlaceholder={t('searchPlaceholder')}
        enableSearch
        country={defaultCountry}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        containerClass={styles.container}
        inputClass={styles.input}
        buttonClass={styles.button}
        dropdownClass={styles.dropdown}
        searchClass={styles.search}
      />
    </div>
  );
};
