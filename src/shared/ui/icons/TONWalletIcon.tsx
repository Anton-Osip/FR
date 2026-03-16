import { type FC, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TONWalletIcon: FC<Props> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      className={className}
    >
      <path
        d="M9.49999 19C14.7467 19 19 14.7467 19 9.5C19 4.2533 14.7467 0 9.49999 0C4.2533 0 0 4.2533 0 9.5C0 14.7467 4.2533 19 9.49999 19Z"
        fill="#F0F5FF"
      />
      <path
        d="M6.25603 5.30228C5.06317 5.30228 4.30712 6.58903 4.90721 7.62921L8.9112 14.5692C9.17249 15.0224 9.82728 15.0224 10.0886 14.5692L14.0934 7.62921C14.6927 6.59067 13.9366 5.30228 12.7446 5.30228H6.25603ZM8.90797 12.488L8.03596 10.8004L5.93189 7.03727C5.79311 6.7964 5.96457 6.48776 6.25521 6.48776H8.90715V12.4889L8.90797 12.488ZM13.0662 7.03645L10.963 10.8012L10.091 12.488V6.48698H12.7429C13.0336 6.48698 13.2051 6.79558 13.0662 7.03645Z"
        fill="#1873F2"
      />
    </svg>
  );
};

TONWalletIcon.displayName = 'TONWalletIcon';
