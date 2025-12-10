import { useState, useMemo } from 'react';
import { getDaysInMonth, startOfMonth, format, addMonths, subMonths } from 'date-fns';
import { getActivitiesOnDate, categorizeActivities, formatActivityDateTime } from '../utils/eventUtils';
import type { Activity } from '../utils/firebaseUtils';

interface MonthlyCalendarProps {
  activities: Activity[];
  onDateClick?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
}

export const MonthlyCalendar = ({
  activities,
  onDateClick,
  month: initialMonth = new Date(),
  onMonthChange,
}: MonthlyCalendarProps) => {
  const [month, setMonth] = useState(initialMonth);

  const daysInMonth = getDaysInMonth(month);
  const firstDay = startOfMonth(month);
  const startingDayOfWeek = firstDay.getDay();

  const monthName = format(month, 'MMMM yyyy');

  const days = useMemo(() => {
    const days: (number | null)[] = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [daysInMonth, startingDayOfWeek]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getActivityBadges = (day: number) => {
    if (!day) return [];

    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return getActivitiesOnDate(activities, date);
  };

  const getEventColor = (activity: Activity) => {
    const categorized = categorizeActivities([activity]);
    if (categorized.current.length > 0) {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (categorized.upcoming.length > 0) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handlePrevMonth = () => {
    const newMonth = subMonths(month, 1);
    setMonth(newMonth);
    if (onMonthChange) onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(month, 1);
    setMonth(newMonth);
    if (onMonthChange) onMonthChange(newMonth);
  };

  const handleToday = () => {
    const newMonth = new Date();
    setMonth(newMonth);
    if (onMonthChange) onMonthChange(newMonth);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2 sm:mb-4">
        <h2 className="text-sm sm:text-lg font-bold text-slate-700">{monthName}</h2>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="px-1.5 py-1 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs sm:text-sm transition"
          >
            ← Prev
          </button>
          <button
            onClick={handleToday}
            className="px-1.5 py-1 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-blue-400 to-teal-400 hover:from-blue-500 hover:to-teal-500 text-white rounded text-xs sm:text-sm transition shadow-md"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="px-1.5 py-1 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs sm:text-sm transition"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((label) => (
          <div key={label} className="font-semibold text-center text-gray-700 py-0.5 sm:py-1 text-xs sm:text-sm">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayActivities = day ? getActivityBadges(day) : [];
          const isToday = day && new Date(month.getFullYear(), month.getMonth(), day).toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              onClick={() => {
                if (day && onDateClick) {
                  onDateClick(new Date(month.getFullYear(), month.getMonth(), day));
                }
              }}
              className={`h-20 p-1 rounded border transition cursor-pointer overflow-y-auto ${
                day
                  ? isToday
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-slate-200 hover:bg-blue-50/30'
                  : 'bg-gray-50/30 border-gray-100'
              }`}
            >
              {day && (
                <>
                  <div className={`font-bold text-xs mb-0.5 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayActivities.slice(0, 2).map((activity) => (
                      <div
                        key={activity.id}
                        className={`text-xs p-0.5 rounded border truncate ${getEventColor(activity)}`}
                        title={`${activity.title} - ${formatActivityDateTime(activity.startDate)}`}
                      >
                        {activity.title}
                      </div>
                    ))}
                    {dayActivities.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayActivities.length - 2}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 flex-wrap justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Now</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Past</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
