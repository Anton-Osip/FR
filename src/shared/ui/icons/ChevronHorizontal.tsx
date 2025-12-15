import type {SVGProps} from 'react';

export type ChevronHorizontalProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export const ChevronHorizontal = ({className = '', ...props}: ChevronHorizontalProps) => {
    return (
        <svg width='14' height='8' viewBox='0 0 14 8' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <g clipPath='url(#clip0_411_200)' className={`${className}`} {...props}>
                <path
                    d='M13 1.00001L7.00005 7L0.999999 1'
                    stroke='#F0F5FF'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            </g>
            <defs>
                <clipPath id='clip0_411_200'>
                    <rect width='14' height='8' fill='white'/>
                </clipPath>
            </defs>
        </svg>
    );
};