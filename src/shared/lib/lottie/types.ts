/**
 * Тип для данных анимации Lottie
 */
export interface LottieAnimationData {
  v?: string;
  fr?: number;
  ip?: number;
  op?: number;
  w?: number;
  h?: number;
  nm?: string;
  ddd?: number;
  assets?: Array<{
    id?: string;
    w?: number;
    h?: number;
    u?: string;
    p?: string;
    e?: number;
  }>;
  layers?: unknown[];
  [key: string]: unknown;
}
