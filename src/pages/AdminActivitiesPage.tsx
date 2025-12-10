import { useState, useEffect, useMemo } from 'react';
import { Trash2, X, Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Activity } from '../utils/firebaseUtils';
import { subscribeToActivities, deleteActivity } from '../utils/firebaseUtils';
import { getActivitiesInMonth } from '../utils/eventUtils';
import AddActivityForm from '../components/AddActivityForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export const AdminActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; activityId?: string; isLoading: boolean }>({
    isOpen: false,
    isLoading: false,
  });
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    setIsLoading(true);
    console.log('AdminActivitiesPage: Setting up subscription');
    const unsubscribe = subscribeToActivities((data) => {
      console.log('AdminActivitiesPage: Received activities:', data);
      setActivities(data);
      setIsLoading(false);
    });

    return () => {
      console.log('AdminActivitiesPage: Cleaning up subscription');
      unsubscribe();
    };
  }, []);

  const handleActivityAdded = () => {
    setShowForm(false);
    setEditingActivity(null);
    toast.success(editingActivity ? 'Activity updated successfully!' : 'Activity added successfully!');
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, activityId: id, isLoading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.activityId) return;

    setDeleteConfirm(prev => ({ ...prev, isLoading: true }));
    try {
      await deleteActivity(deleteConfirm.activityId);
      setActivities(activities.filter(a => a.id !== deleteConfirm.activityId));
      setDeleteConfirm({ isOpen: false, isLoading: false });
      toast.success('Activity deleted successfully!');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
      setDeleteConfirm(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Derive available months from activities (unique month-year values, newest first)
  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    activities.forEach((activity) => {
      const start = activity.startDate.toDate();
      const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    });

    return Array.from(months)
      .sort((a, b) => (a > b ? -1 : 1))
      .map((key) => {
        const [year, month] = key.split('-').map(Number);
        const label = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return { key, label, year, month };
      });
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (selectedMonth === 'all') return activities;
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    return getActivitiesInMonth(activities, year, month);
  }, [activities, selectedMonth]);

  // Group activities by their start date (no empty days shown)
  const groupedByDate = useMemo(() => {
    const groups: Record<string, { date: Date; items: Activity[] }> = {};
    filteredActivities.forEach((activity) => {
      const start = activity.startDate.toDate();
      const dateKey = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups[dateKey]) {
        groups[dateKey] = { date: new Date(start.getFullYear(), start.getMonth(), start.getDate()), items: [] };
      }
      groups[dateKey].items.push(activity);
    });

    return Object.values(groups).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredActivities]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-700 mb-1">List of Activities</h2>
          <p className="text-slate-600 text-sm">
            All activities · {activities.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="sr-only">Filter by month</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 pl-3 pr-10 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="all">All months</option>
              {monthOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow-md flex items-center gap-2"
          >
            <Plus size={20} />
            Add Activity
          </button>
        </div>
      </div>

      {/* Mobile month filter */}
      <div className="md:hidden">
        <label className="sr-only">Filter by month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full pl-3 pr-8 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm bg-white"
        >
          <option value="all">All months</option>
          {monthOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Activities Grid */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-slate-600 mt-4">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-xl border-2 border-dashed border-blue-200">
            <p className="text-slate-600 font-medium">No activities yet</p>
            <p className="text-slate-500 text-sm mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByDate.map((group) => (
              <div key={group.date.toISOString()} className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-slate-800">{group.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                  <span className="text-xs text-slate-500">{group.items.length} activit{group.items.length === 1 ? 'y' : 'ies'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 rounded-lg border-l-4 border-l-blue-400 bg-blue-50/60 hover:shadow-md transition duration-200"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-700 truncate">{activity.type || activity.title}</h4>
                            {activity.participant && (
                              <p className="text-xs text-slate-500 truncate">👤 {activity.participant}</p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleEditActivity(activity)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200"
                              title="Edit activity"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => activity.id && handleDeleteClick(activity.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition duration-200"
                              title="Delete activity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {activity.description && (
                          <p className="text-slate-600 text-xs line-clamp-2">{activity.description}</p>
                        )}
                        <div className="space-y-0.5 text-xs text-slate-600">
                          <div className="font-semibold text-slate-800">⏰ {activity.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {activity.endDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                          {activity.location && (
                            <div className="truncate"><span className="font-medium">📍</span> {activity.location}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-blue-100 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-700">
                {editingActivity ? 'Edit Activity' : 'Add New Activity'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingActivity(null);
                }}
                className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition duration-200"
                title="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <AddActivityForm 
                onSuccess={handleActivityAdded} 
                onCancel={() => {
                  setShowForm(false);
                  setEditingActivity(null);
                }}
                activity={editingActivity || undefined} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        title="Delete Activity"
        message="Are you sure you want to delete this activity?"
        isOpen={deleteConfirm.isOpen}
        isLoading={deleteConfirm.isLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, isLoading: false })}
      />
    </div>
  );
};

export default AdminActivitiesPage;
