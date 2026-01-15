import { type FC } from 'react';

interface Props {
  className?: string;
}

export const ArrowIcon: FC<Props> = ({ className }) => {
  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="21" viewBox="0 0 16 21" fill="none">
        <path
          d="M9.6 19.3421C9.6 20.2577 8.88365 21 8 21C7.11634 21 6.4 20.2577 6.4 19.3421L6.4 5.66041L2.73137 9.46178C2.10653 10.1092 1.09347 10.1092 0.468629 9.46178C-0.15621 8.81433 -0.15621 7.76461 0.468629 7.11716L6.86863 0.485587C7.16869 0.174671 7.57565 -3.84359e-08 8 0C8.42435 3.84439e-08 8.83131 0.174671 9.13137 0.485587L15.5314 7.11716C16.1562 7.76461 16.1562 8.81433 15.5314 9.46178C14.9065 10.1092 13.8935 10.1092 13.2686 9.46178L9.6 5.66041V19.3421Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
