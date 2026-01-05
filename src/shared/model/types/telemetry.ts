export type Level = 'info' | 'warn' | 'error' | 'debug';
export type Ctx = Record<string, unknown>;
export type Entry = { level: Level; msg: string; ts: string; reqId?: string; ctx?: Ctx };
