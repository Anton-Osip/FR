import type { DeviceType } from '@app/store';

import type { NavigatorWithUserAgentData } from '@shared/model';

const USER_AGENT_MOBILE_RE = /Mobile|Android|iPhone|iPad|iPod/i;

/**
 * Определяет тип устройства (мобильный или десктоп)
 */
export function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'desktop';
  }

  const nav = navigator as NavigatorWithUserAgentData;
  const userAgent = navigator.userAgent || '';
  const uaData = nav.userAgentData || null;
  const uaMobile = !!uaData && uaData.mobile === true;

  const isMobile = USER_AGENT_MOBILE_RE.test(userAgent) || uaMobile;

  return isMobile ? 'mobile' : 'desktop';
}
