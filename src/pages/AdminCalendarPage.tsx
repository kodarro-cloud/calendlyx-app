import { useState, useEffect, useMemo } from 'react';
import type { Activity } from '../utils/firebaseUtils';
import { subscribeToActivities } from '../utils/firebaseUtils';
import { getActivitiesInMonth, categorizeActivities, getActivitiesOnDate } from '../utils/eventUtils';
import MonthlyCalendar from '../components/MonthlyCalendar';

export const AdminCalendarPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToActivities((data) => {
      setActivities(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(null);
  };

  // Get activities for current month
  const monthActivities = getActivitiesInMonth(
    activities,
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );

  const categorized = useMemo(() => categorizeActivities(activities), [activities]);

  const displayActivities = useMemo(() => {
    if (selectedDate) {
      return getActivitiesOnDate(activities, selectedDate);
    }
    return monthActivities;
  }, [activities, monthActivities, selectedDate]);

  return (
    <div className="space-y-6">

      {/* Calendar */}
      {isLoading ? (
        <div className="text-center py-12 bg-white/50 rounded-xl border-2 border-dashed border-blue-200">
          <div className="inline-block animate-spin rounded-full h-full w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-600 mt-4">Loading calendar...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Calendar Grid */}
          <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-xl border-blue-100 h-full overflow-hidden">
            <MonthlyCalendar
              activities={activities}
              month={currentDate}
              onMonthChange={handleMonthChange}
              onDateClick={setSelectedDate}
            />
          </div>

          {/* Activities List Column */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 h-full max-h-[790px] flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-slate-700 mb-4">Activities</h3>

            {displayActivities.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No activities {selectedDate ? 'on this date' : 'this month'}</p>
            ) : selectedDate ? (
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 min-h-0">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h4>
                  <div className="space-y-2">
                    {displayActivities.map((activity) => {
                      const isCurrent = categorized.current.some((a) => a.id === activity.id);
                      return (
                        <div
                          key={activity.id}
                          className="p-3 rounded-lg border-l-4 border-l-blue-400 bg-blue-50/60 hover:shadow-md transition duration-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-700 truncate">{activity.title}</h4>
                              <div className="space-y-0.5 text-xs text-slate-600 mt-1">
                                <div className="font-semibold text-slate-800">
                                  ⏰ {activity.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {activity.endDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </div>
                                {activity.type && <div><span className="font-medium">•</span> {activity.type}</div>}
                                {activity.location && (
                                  <div><span className="font-medium">📍</span> {activity.location}</div>
                                )}
                              </div>
                            </div>
                            {isCurrent && <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">LIVE</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 min-h-0">
                {Object.entries(
                  monthActivities.reduce((acc, activity) => {
                    const dateKey = activity.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    if (!acc[dateKey]) acc[dateKey] = [];
                    acc[dateKey].push(activity);
                    return acc;
                  }, {} as Record<string, Activity[]>)
                )
                  .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                  .map(([dateKey, dateActivities]) => (
                    <div key={dateKey}>
                      <h4 className="font-semibold text-slate-800 mb-2">{dateKey}</h4>
                      <div className="space-y-2 ml-2">
                        {dateActivities.map((activity) => {
                          const isCurrent = categorized.current.some((a) => a.id === activity.id);
                          return (
                            <div
                              key={activity.id}
                              className="p-2 rounded border-l-4 border-l-blue-400 bg-blue-50/60 hover:shadow-sm transition duration-200"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-slate-700 truncate">{activity.title}</h4>
                                  <div className="space-y-0 text-[11px] text-slate-600 mt-0.5">
                                    <div className="font-semibold text-slate-800">
                                      ⏰ {activity.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {activity.endDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </div>
                                    {activity.type && <div><span className="font-medium">•</span> {activity.type}</div>}
                                    {activity.location && (
                                      <div><span className="font-medium">📍</span> {activity.location}</div>
                                    )}
                                  </div>
                                </div>
                                {isCurrent && <span className="text-[8px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">LIVE</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-2 text-xs px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
              >
                Back to month
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendarPage;
