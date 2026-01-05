export type ApiErrorBody = {
  error?: string;
  detail?: string;
  [k: string]: unknown;
};

export type FetchJsonResult<T> =
  | { ok: true; status: number; requestId: string; data: T }
  | { ok: false; status: number; requestId: string; data: ApiErrorBody };
