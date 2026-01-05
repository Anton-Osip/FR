export type UaBrand = { brand: string; version: string };

export type ClientProfilePayload = {
  language: string;
  timezone: string;
  screenRes: string;
  userAgent: string;
  uaBrands: UaBrand[];
  uaMobile: boolean;
  platform: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  maxTouchPoints?: number;
  webglVendor: string;
  webglRenderer: string;
  canvasHash: string;
  browserId: string;
  deviceType: 'mobile' | 'desktop';
  clientVersion: string;
};

export type ClientProfileBase = Omit<ClientProfilePayload, 'clientVersion'>;
