import { useState } from 'react';
import AddEventForm from '../components/AddEventForm';
import YearlyView from '../components/YearlyView';
import { subscribeToActivities } from '../utils/firebaseUtils';
import type { Activity } from '../utils/firebaseUtils';
import { useEffect } from 'react';

export const AdminEventsPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');

  useEffect(() => {
    setIsLoadingActivities(true);

    try {
      // Load all activities (not just public)
      const unsubscribe = subscribeToActivities((updatedActivities) => {
        setActivities(updatedActivities);
        setIsLoadingActivities(false);
      }, false);

      return unsubscribe;
    } catch (err) {
      console.error('Error loading activities:', err);
      setIsLoadingActivities(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-blue-600 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Admin - Event Management</h1>
          <p className="text-slate-100">Create and manage your events</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                : 'bg-white/80 text-slate-700 hover:bg-blue-50 border border-slate-200'
            }`}
          >
            + Add Activity
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'view'
                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                : 'bg-white/80 text-slate-700 hover:bg-blue-50 border border-slate-200'
            }`}
          >
            View All Activities ({activities.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'add' ? (
          <AddEventForm />
        ) : (
          <div>
            {isLoadingActivities ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading activities...</p>
              </div>
            ) : (
              <YearlyView activities={activities} year={new Date().getFullYear()} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventsPage;
