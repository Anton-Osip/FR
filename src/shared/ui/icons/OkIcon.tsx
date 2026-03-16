import { type FC } from 'react';

interface Props {
  className?: string;
}

export const OkIcon: FC<Props> = ({ className }) => {
  return (
    <div className={className}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM11.2243 5.57574C11.4586 5.81005 11.4586 6.18995 11.2243 6.42426L7.22427 10.4243C6.98995 10.6586 6.61005 10.6586 6.37574 10.4243L4.77574 8.82427C4.54142 8.58995 4.54142 8.21005 4.77574 7.97574C5.01005 7.74142 5.38995 7.74142 5.62426 7.97574L6.8 9.15147L10.3757 5.57574C10.6101 5.34142 10.99 5.34142 11.2243 5.57574Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
