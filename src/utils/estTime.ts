/**
 * EST / New York Time Utilities for Daily Casino Reset at 12:00 AM EST
 */

export const EST_TIMEZONE = 'America/New_York';

/**
 * Returns the current date in YYYY-MM-DD format in Eastern Time (America/New_York)
 */
export function getCurrentEstDateString(timestamp: number = Date.now()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: EST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date(timestamp));
  } catch (e) {
    // Fallback if timezone not supported
    const d = new Date(timestamp - 5 * 3600 * 1000);
    return d.toISOString().split('T')[0];
  }
}

/**
 * Returns formatted friendly EST date string (e.g. "Aug 23, 2026")
 */
export function formatEstDateFriendly(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Returns the yesterday date string in EST
 */
export function getYesterdayEstDateString(timestamp: number = Date.now()): string {
  const currentEst = getCurrentEstDateString(timestamp);
  const [year, month, day] = currentEst.split('-').map(Number);
  const d = new Date(year, month - 1, day - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Calculates live time remaining until 12:00 AM EST (midnight)
 */
export function getTimeUntilEstMidnight(): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  msRemaining: number;
} {
  const now = new Date();

  // Create Date object representing current time in EST
  const estDateStr = now.toLocaleDateString('en-US', { timeZone: EST_TIMEZONE });
  const estTimeStr = now.toLocaleTimeString('en-US', { timeZone: EST_TIMEZONE, hour12: false });
  
  // Calculate next midnight in EST
  // In EST string: MM/DD/YYYY, HH:MM:SS
  const [hStr, mStr, sStr] = estTimeStr.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  const s = parseInt(sStr || '0', 10);

  const secondsPassedToday = h * 3600 + m * 60 + s;
  const totalSecondsInDay = 86400;
  const secondsRemaining = Math.max(0, totalSecondsInDay - secondsPassedToday);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    formatted: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
    msRemaining: secondsRemaining * 1000,
  };
}
