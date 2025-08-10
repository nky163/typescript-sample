/** 時間計算ユーティリティ (マジックナンバー定数化) */
export const MS_PER_SECOND = 1_000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MS_PER_DAY = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY; // 86_400_000

/** n 日前の Date を返す */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * MS_PER_DAY);
}
