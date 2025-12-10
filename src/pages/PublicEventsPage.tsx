import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { subscribeToActivities, subscribeToScheduleRequests } from '../utils/firebaseUtils';
import { categorizeActivities, getActivitiesInMonth, getActivitiesOnDate } from '../utils/eventUtils';
import MonthlyCalendar from '../components/MonthlyCalendar';
import ScheduleRequestForm from '../components/ScheduleRequestForm';
import type { Activity, ScheduleRequest } from '../utils/firebaseUtils';

export const PublicEventsPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllMonth, setShowAllMonth] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    try {
      const unsubscribeActivities = subscribeToActivities((updatedActivities) => {
        setActivities(updatedActivities);
        setIsLoading(false);
        setError(null);
      }, true); // publicOnly = true

      const unsubscribeRequests = subscribeToScheduleRequests((requests) => {
        setScheduleRequests(requests);
      });

      return () => {
        unsubscribeActivities();
        unsubscribeRequests();
      };
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Failed to load activities. Please try again later.');
      setIsLoading(false);
    }
  }, []);

  const categorized = categorizeActivities(activities);
  const todayActivities = getActivitiesOnDate(activities, new Date());
  const monthActivities = getActivitiesInMonth(activities, currentMonth.getFullYear(), currentMonth.getMonth() + 1);

  // Group month activities once for display toggling
  const monthGroups = Object.entries(
    monthActivities.reduce((acc, activity) => {
      const date = activity.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!acc[date]) acc[date] = [] as Activity[];
      acc[date].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>)
  ).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

  const visibleMonthGroups = showAllMonth ? monthGroups : monthGroups.slice(0, 6);

  const displayActivities = selectedDate
    ? activities.filter((activity) => {
        const startDate = activity.startDate.toDate();
        const endDate = activity.endDate.toDate();
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);
        return startDate <= dayEnd && endDate >= dayStart;
      })
    : monthActivities;



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      <div className="bg-gradient-to-r from-slate-500 via-blue-500 to-teal-500 text-white py-6 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Activities</h1>
            <p className="text-slate-100 text-sm sm:text-base">Discover what's happening</p>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="bg-white text-blue-600 hover:bg-slate-100 font-semibold py-2 px-4 sm:px-6 rounded-lg transition duration-200 shadow-md flex items-center gap-2 whitespace-nowrap text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            <span>Request Schedule</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-3 sm:mb-4">🔴 Happening Now</h2>
              {todayActivities.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {todayActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="font-semibold text-gray-900 text-sm truncate">{activity.title}</p>
                      {activity.type && <p className="text-xs text-purple-600 font-medium">{activity.type}</p>}
                      {activity.location && <p className="text-xs text-gray-600 mt-1">📍 {activity.location}</p>}
                    </div>
                  ))}
                  {todayActivities.length > 5 && <p className="text-sm text-gray-500 pt-2">+{todayActivities.length - 5} more</p>}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">None right now</p>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-700">📅 Upcoming</h2>
                {categorized.upcoming.length > 5 && (
                  <button
                    onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    {showAllUpcoming ? 'Show less' : `View all (${categorized.upcoming.length})`}
                  </button>
                )}
              </div>
              {categorized.upcoming.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {(showAllUpcoming ? categorized.upcoming : categorized.upcoming.slice(0, 5)).map((activity) => (
                    <div key={activity.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="font-semibold text-gray-900 text-sm truncate">{activity.title}</p>
                      {activity.type && <p className="text-xs text-purple-600 font-medium">{activity.type}</p>}
                      <p className="text-xs text-gray-800 font-semibold mt-1">
                        ⏰ {activity.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {activity.endDate && (
                          <span> → {activity.endDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">None scheduled</p>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-3 sm:mb-4">📋 Schedule Requests</h2>
              {scheduleRequests.filter(r => r.status === 'pending').length > 0 ? (
                <div className="space-y-2">
                  {scheduleRequests.filter(r => r.status === 'pending').slice(0, 5).map((request) => (
                    <div key={request.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="font-semibold text-gray-900 text-sm truncate">{request.title}</p>
                      <p className="text-xs text-gray-600 mt-1">👤 {request.requesterName}</p>
                      <p className="text-xs text-gray-600">📅 {request.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-600">⏰ {request.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                      <p className="text-[10px] text-yellow-700 font-medium mt-1">Pending Review</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No pending requests</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-1 lg:order-2">
            {isLoading && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading activities...</p>
              </div>
            )}
            {error && <div className="bg-red-50 border border-red-300 rounded-xl p-4"><p className="text-red-700">{error}</p></div>}
            {!isLoading && !error && (
              <>
                <MonthlyCalendar activities={activities} onDateClick={setSelectedDate} month={currentMonth} onMonthChange={setCurrentMonth} />
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
                  {selectedDate ? (
                    // Daily view
                    <>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mb-4 sm:mb-6">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                      {displayActivities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {displayActivities.map((activity) => {
                            const isCurrent = categorized.current.some(a => a.id === activity.id);
                            return (
                              <div key={activity.id} className={`p-3 rounded-lg border-l-4 transition shadow-sm hover:shadow-md bg-white/80 ${
                                isCurrent ? 'border-l-green-500' : 'border-l-blue-400'
                              }`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-slate-900 text-sm truncate">{activity.title}</h3>
                                      {activity.type && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded">
                                          {activity.type}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-800 font-semibold">
                                      ⏰ {activity.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                      {activity.endDate && (
                                        <span> → {activity.endDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                      )}
                                    </p>
                                    {activity.location && <p className="text-xs text-slate-600 mt-1">📍 {activity.location}</p>}
                                    {activity.description && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{activity.description}</p>}
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {isCurrent && <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded-full">LIVE</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 text-sm sm:text-base">No activities on this date</p>
                      )}
                      <button onClick={() => setSelectedDate(null)} className="mt-4 sm:mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition text-sm sm:text-base w-full sm:w-auto">Back to Monthly View</button>
                    </>
                  ) : (
                    // Monthly list view
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-700">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Activities
                        </h2>
                        {monthGroups.length > 6 && (
                          <button
                            onClick={() => setShowAllMonth(!showAllMonth)}
                            className="text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap"
                          >
                            {showAllMonth ? 'Show fewer' : `View all (${monthGroups.length} days)`}
                          </button>
                        )}
                      </div>
                      {monthActivities.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                          {visibleMonthGroups.map(([date, dateActivities]) => (
                            <div key={date} className="bg-white/70 border border-blue-100 rounded-xl p-3 sm:p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <h3 className="text-base sm:text-lg font-bold text-slate-800">{date}</h3>
                                <span className="text-xs text-slate-500">{dateActivities.length} activit{dateActivities.length === 1 ? 'y' : 'ies'}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dateActivities.map((activity) => {
                                  const isCurrent = categorized.current.some(a => a.id === activity.id);
                                  return (
                                    <div
                                      key={activity.id}
                                      className="p-3 rounded-lg border-l-4 border-l-blue-400 bg-blue-50/60 hover:shadow-md transition duration-200"
                                    >
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <h4 className="text-sm font-bold text-slate-700 flex-1">{activity.title}</h4>
                                          {isCurrent && <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded-full whitespace-nowrap">LIVE</span>}
                                        </div>
                                        {activity.description && (
                                          <p className="text-slate-600 text-xs line-clamp-2">{activity.description}</p>
                                        )}
                                        <div className="space-y-0.5 text-xs text-slate-600">
                                          <div className="font-semibold text-slate-800">
                                            ⏰ {activity.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {activity.endDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                          </div>
                                          {activity.type && <div><span className="font-medium">•</span> {activity.type}</div>}
                                          {activity.location && (
                                            <div><span className="font-medium">📍</span> {activity.location}</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          {!showAllMonth && monthGroups.length > 6 && (
                            <div className="text-center pt-2">
                              <button
                                onClick={() => setShowAllMonth(true)}
                                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                              >
                                View all activities
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">No activities this month</p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ScheduleRequestForm 
        isOpen={showRequestForm} 
        onClose={() => setShowRequestForm(false)}
        onSuccess={() => {
          // Refresh will happen via subscription
        }}
      />
    </div>
  );
};

export default PublicEventsPage;
