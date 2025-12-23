export type NavigatorUserAgentDataBrand = {
  brand?: unknown;
  version?: unknown;
};

export type NavigatorUserAgentData = {
  brands?: unknown;
  mobile?: unknown;
  platform?: unknown;
};

export type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: NavigatorUserAgentData;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  maxTouchPoints?: number;
};
