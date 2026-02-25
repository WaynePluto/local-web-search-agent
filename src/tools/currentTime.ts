/**
 * 获取当前时间信息工具
 */

export interface DateTimeInfo {
  /** 当前完整日期时间 */
  currentDateTime: string;
  /** 当前年份 */
  currentYear: number;
  /** 当前月份 */
  currentMonth: number;
  /** 当前日期 */
  currentDay: number;
  /** 去年年份 */
  lastYear: number;
  /** 前年年份 */
  yearBeforeLast: number;
  /** ISO 格式日期 */
  isoDate: string;
}

/**
 * 获取当前时间信息
 * @returns 当前时间相关信息
 */
export function getCurrentTime(): DateTimeInfo {
  const now = new Date();
  const currentYear = now.getFullYear();

  return {
    currentDateTime: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    currentYear,
    currentMonth: now.getMonth() + 1,
    currentDay: now.getDate(),
    lastYear: currentYear - 1,
    yearBeforeLast: currentYear - 2,
    isoDate: now.toISOString(),
  };
}
