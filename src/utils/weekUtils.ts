/**
 * Utility functions for calculating ISO week numbers, payment cycles and dates.
 */

export interface WeekPeriodInfo {
  weekNumber: number;
  year: number;
  startDate: Date; // Monday
  endDate: Date; // Sunday
  wednesdayDate: Date; // Approval day
  fridayDate: Date; // Payment day
  formattedRange: string; // e.g. "10/08/2026 a 16/08/2026"
  formattedShortRange: string; // e.g. "10/08 a 16/08"
  mondayFormatted: string; // e.g. "10/08/2026"
  wednesdayFormatted: string; // e.g. "12/08/2026"
  fridayFormatted: string; // e.g. "14/08/2026"
  sundayFormatted: string; // e.g. "16/08/2026"
  isCurrentWeek: boolean;
}

/**
 * Calculates ISO-8601 week number and year for a given date.
 */
export function getISOWeekNumber(date: Date = new Date()): { weekNumber: number; year: number } {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  target.setDate(target.getDate() - dayNr + 3); // Thursday of current week
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return { weekNumber, year };
}

/**
 * Given a year and week number, calculates the full period (Monday to Sunday) and key dates.
 */
export function getWeekPeriodInfo(weekNumber: number, year: number = new Date().getFullYear()): WeekPeriodInfo {
  // Simple algorithm to find the Monday of the ISO week
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
  const dayOfWeek = simple.getDay();
  const ISOweekStart = new Date(simple);
  if (dayOfWeek <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }

  const startDate = new Date(ISOweekStart); // Monday
  const wednesdayDate = new Date(startDate);
  wednesdayDate.setDate(startDate.getDate() + 2); // Wednesday

  const fridayDate = new Date(startDate);
  fridayDate.setDate(startDate.getDate() + 4); // Friday

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Sunday

  const formatDate = (d: Date, withYear: boolean = true) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return withYear ? `${day}/${month}/${d.getFullYear()}` : `${day}/${month}`;
  };

  const now = new Date();
  const currentISO = getISOWeekNumber(now);
  const isCurrentWeek = currentISO.weekNumber === weekNumber && currentISO.year === year;

  return {
    weekNumber,
    year,
    startDate,
    endDate,
    wednesdayDate,
    fridayDate,
    formattedRange: `${formatDate(startDate)} a ${formatDate(endDate)}`,
    formattedShortRange: `${formatDate(startDate, false)} a ${formatDate(endDate, false)}`,
    mondayFormatted: formatDate(startDate),
    wednesdayFormatted: formatDate(wednesdayDate),
    fridayFormatted: formatDate(fridayDate),
    sundayFormatted: formatDate(endDate),
    isCurrentWeek,
  };
}

/**
 * Returns a list of all 52/53 weeks for a given year.
 */
export function getAllWeeksOfYear(year: number = 2026): WeekPeriodInfo[] {
  const weeks: WeekPeriodInfo[] = [];
  for (let w = 1; w <= 52; w++) {
    weeks.push(getWeekPeriodInfo(w, year));
  }
  return weeks;
}
