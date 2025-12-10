import { getActivitiesInMonth, formatActivityDate, categorizeActivities } from '../utils/eventUtils';
import type { Activity } from '../utils/firebaseUtils';

interface YearlyViewProps {
  activities: Activity[];
  year?: number;
}

export const YearlyView = ({ activities, year = new Date().getFullYear() }: YearlyViewProps) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getActivityColor = (activity: Activity) => {
    const categorized = categorizeActivities([activity]);
    if (categorized.current.length > 0) {
      return 'bg-green-50 border-l-4 border-green-500';
    } else if (categorized.upcoming.length > 0) {
      return 'bg-blue-50 border-l-4 border-blue-500';
    }
    return 'bg-gray-50 border-l-4 border-gray-300';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-slate-700 mb-8 text-center">{year} Activities Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {months.map((month, monthIndex) => {
          const monthActivities = getActivitiesInMonth(activities, year, monthIndex + 1);
          const hasActivities = monthActivities.length > 0;

          return (
            <div
              key={month}
              className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white/50"
            >
              {/* Month Header */}
              <div className="bg-gradient-to-r from-blue-400 to-teal-400 text-white p-4">
                <h3 className="text-lg font-semibold">{month} {year}</h3>
                <p className="text-sm text-blue-50">{monthActivities.length} activity(ies)</p>
              </div>

              {/* Activities List */}
              <div className="p-4 max-h-96 overflow-y-auto">
                {hasActivities ? (
                  <div className="space-y-2">
                    {monthActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`p-3 rounded-md text-sm transition hover:shadow-md ${getActivityColor(activity)}`}
                      >
                        <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatActivityDate(activity.startDate)}
                        </p>
                        {activity.location && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            📍 {activity.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <p className="text-center">No activities scheduled</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex gap-6 flex-wrap justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Happening Now</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded"></div>
          <span>Past</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyView;
