import { FC } from 'react';

import clsx from 'clsx';

import styles from './Spinner.module.scss';

interface SpinnerProps {
  className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ className }) => {
  return (
    <div className={clsx(styles.spinner, className)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none">
        <g filter="url(#filter0_d_1234_44182)">
          <g clipPath="url(#paint0_angular_1234_44182_clip_path)" data-figma-skip-parse="true">
            <g transform="matrix(0 0.032 -0.032 0 64 64)">
              <foreignObject x="-1019.14" y="-1019.14" width="2038.28" height="2038.28">
                <div
                  style={{
                    background: 'conic-gradient(from 90deg, rgba(0, 149, 255, 1) 0deg, rgba(0, 149, 255, 0) 360deg)',
                    height: '100%',
                    width: '100%',
                    opacity: 1,
                  }}
                ></div>
              </foreignObject>
            </g>
          </g>
          <path
            d="M96 64C96 81.6731 81.6731 96 64 96C46.3269 96 32 81.6731 32 64C32 46.3269 46.3269 32 64 32C81.6731 32 96 46.3269 96 64ZM33.6 64C33.6 80.7895 47.2105 94.4 64 94.4C80.7895 94.4 94.4 80.7895 94.4 64C94.4 47.2105 80.7895 33.6 64 33.6C47.2105 33.6 33.6 47.2105 33.6 64Z"
            data-figma-gradient-fill='{"type":"GRADIENT_ANGULAR","stops":[{"color":{"r":0.0,"g":0.58431375026702881,"b":1.0,"a":1.0},"position":0.0},{"color":{"r":0.0,"g":0.58431375026702881,"b":1.0,"a":0.0},"position":1.0}],"stopsVar":[{"color":{"r":0.0,"g":0.58431375026702881,"b":1.0,"a":1.0},"position":0.0},{"color":{"r":0.0,"g":0.58431375026702881,"b":1.0,"a":0.0},"position":1.0}],"transform":{"m00":3.9188699282725371e-15,"m01":-64.0,"m02":96.0,"m10":64.0,"m11":3.9188699282725371e-15,"m12":32.0},"opacity":1.0,"blendMode":"NORMAL","visible":true}'
            shapeRendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_1234_44182"
            x="0"
            y="0"
            width="128"
            height="128"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="16" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.0941176 0 0 0 0 0.45098 0 0 0 0 0.94902 0 0 0 0.5 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1234_44182" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1234_44182" result="shape" />
          </filter>
          <clipPath id="paint0_angular_1234_44182_clip_path">
            <path
              d="M96 64C96 81.6731 81.6731 96 64 96C46.3269 96 32 81.6731 32 64C32 46.3269 46.3269 32 64 32C81.6731 32 96 46.3269 96 64ZM33.6 64C33.6 80.7895 47.2105 94.4 64 94.4C80.7895 94.4 94.4 80.7895 94.4 64C94.4 47.2105 80.7895 33.6 64 33.6C47.2105 33.6 33.6 47.2105 33.6 64Z"
              shapeRendering="crispEdges"
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};
