import { FC, useMemo } from 'react';

import clsx from 'clsx';

import { Button } from '@shared/ui';

import styles from './AmountSteps.module.scss';

const DEFAULT_MAX_AMOUNT_MULTIPLIER = 10;
const ROUNDING_STEP = 5;

interface AmountStepsProps {
  minAmount: number;
  maxAmount?: number;
  buttonCount: number;
  currencySymbol: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const AmountSteps: FC<AmountStepsProps> = ({
  minAmount,
  maxAmount,
  buttonCount,
  currencySymbol,
  value,
  onChange,
  className,
}) => {
  const steps = useMemo(() => {
    const effectiveMaxAmount = maxAmount ?? minAmount * DEFAULT_MAX_AMOUNT_MULTIPLIER;
    const stepSize = (effectiveMaxAmount - minAmount) / (buttonCount - 1);

    return Array.from({ length: buttonCount }, (_, index) => {
      const rawValue = minAmount + stepSize * index;

      // Для первого и последнего шага используем точные значения
      if (index === 0) {
        return {
          id: String(index + 1),
          value: String(Math.round(minAmount)),
        };
      }

      if (index === buttonCount - 1) {
        return {
          id: String(index + 1),
          value: String(Math.round(effectiveMaxAmount)),
        };
      }

      // Для промежуточных шагов округляем до ближайшего числа, заканчивающегося на 5 или 0
      const stepValue = Math.round(rawValue / ROUNDING_STEP) * ROUNDING_STEP;

      return {
        id: String(index + 1),
        value: String(stepValue),
      };
    });
  }, [minAmount, maxAmount, buttonCount]);

  return (
    <div className={clsx(styles.steps, className)}>
      {steps.map(step => (
        <Button
          variant={'tertiary'}
          key={step.id}
          active={step.value === value}
          onClick={() => onChange(step.value)}
          className={styles.stepsBtn}
        >
          {step.value} {currencySymbol}
        </Button>
      ))}
    </div>
  );
};
