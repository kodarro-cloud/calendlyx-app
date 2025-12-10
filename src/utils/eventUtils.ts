import { isAfter, isBefore, isWithinInterval } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { Activity } from './firebaseUtils';

export interface CategorizedActivities {
  current: Activity[];
  upcoming: Activity[];
  past: Activity[];
}

/**
 * Convert Firestore Timestamp to Date
 */
const toDate = (timestamp: Timestamp | Date): Date => {
  return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
};

/**
 * Categorize activities into Current, Upcoming, and Past
 * Current: Activities happening right now (now is between startDate and endDate)
 * Upcoming: Activities where startDate is in the future
 * Past: Activities where endDate is in the past
 *
 * @param activities - Array of activity objects
 * @param now - Current date/time (defaults to Date.now())
 * @returns Object with three arrays: current, upcoming, past
 */
export const categorizeActivities = (activities: Activity[], now: Date = new Date()): CategorizedActivities => {
  const current: Activity[] = [];
  const upcoming: Activity[] = [];
  const past: Activity[] = [];

  activities.forEach((activity) => {
    const startDate = toDate(activity.startDate);
    const endDate = toDate(activity.endDate);

    // Check if activity is current (now is between start and end)
    if (isWithinInterval(now, { start: startDate, end: endDate })) {
      current.push(activity);
    }
    // Check if activity is upcoming (start is in the future)
    else if (isAfter(startDate, now)) {
      upcoming.push(activity);
    }
    // Otherwise it's past (end is in the past)
    else {
      past.push(activity);
    }
  });

  // Sort within each category
  current.sort((a, b) => {
    const aStart = toDate(a.startDate);
    const bStart = toDate(b.startDate);
    return aStart.getTime() - bStart.getTime();
  });

  upcoming.sort((a, b) => {
    const aStart = toDate(a.startDate);
    const bStart = toDate(b.startDate);
    return aStart.getTime() - bStart.getTime();
  });

  past.sort((a, b) => {
    const aStart = toDate(a.startDate);
    const bStart = toDate(b.startDate);
    return bStart.getTime() - aStart.getTime(); // Reverse order for past
  });

  return { current, upcoming, past };
};

/**
 * Get activities that occur on a specific date
 * @param activities - Array of activities
 * @param date - The date to filter for
 * @returns Array of activities occurring on that date
 */
export const getActivitiesOnDate = (activities: Activity[], date: Date): Activity[] => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return activities.filter((activity) => {
    const startDate = toDate(activity.startDate);
    const endDate = toDate(activity.endDate);

    return isWithinInterval(startDate, { start: startOfDay, end: endOfDay }) ||
           isWithinInterval(endDate, { start: startOfDay, end: endOfDay }) ||
           (isBefore(startDate, startOfDay) && isAfter(endDate, endOfDay));
  });
};

/**
 * Get activities occurring in a specific month
 * @param activities - Array of activities
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Array of activities occurring in that month
 */
export const getActivitiesInMonth = (activities: Activity[], year: number, month: number): Activity[] => {
  // month is 1-indexed when called, convert to 0-indexed for Date
  const startOfMonthDate = new Date(year, month - 1, 1);
  startOfMonthDate.setHours(0, 0, 0, 0);

  const endOfMonthDate = new Date(year, month, 0);
  endOfMonthDate.setHours(23, 59, 59, 999);

  return activities.filter((activity) => {
    const startDate = toDate(activity.startDate);
    const endDate = toDate(activity.endDate);

    return (
      isBefore(startDate, endOfMonthDate) &&
      isAfter(endDate, startOfMonthDate)
    );
  });
};

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Dec 10, 2025")
 */
export const formatActivityDate = (date: Timestamp | Date): string => {
  const dateObj = toDate(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date and time to a readable string
 * @param date - The date to format
 * @returns Formatted date time string (e.g., "Dec 10, 2025 2:30 PM")
 */
export const formatActivityDateTime = (date: Timestamp | Date): string => {
  const dateObj = toDate(date);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
