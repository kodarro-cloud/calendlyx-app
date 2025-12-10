import { Toaster } from 'react-hot-toast';
import { LogOut } from 'lucide-react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AdminActivitiesPage } from './AdminActivitiesPage';
import { AdminCalendarPage } from './AdminCalendarPage';
import { AdminRequestsPage } from './AdminRequestsPage';
import { SettingsPage } from './SettingsPage';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      <Toaster position="top-right" />

      {/* Header/Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-700">Calendlyx</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <NavLink
              to="/dashboard/activities"
              className={({ isActive }: { isActive: boolean }) => `px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                  : 'bg-white/60 text-slate-600 hover:bg-white/80'
              }`}
            >
              Activities
            </NavLink>
            <NavLink
              to="/dashboard/calendar"
              className={({ isActive }: { isActive: boolean }) => `px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                  : 'bg-white/60 text-slate-600 hover:bg-white/80'
              }`}
            >
              Calendar
            </NavLink>
            <NavLink
              to="/dashboard/requests"
              className={({ isActive }: { isActive: boolean }) => `px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                  : 'bg-white/60 text-slate-600 hover:bg-white/80'
              }`}
            >
              Requests
            </NavLink>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }: { isActive: boolean }) => `px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                  : 'bg-white/60 text-slate-600 hover:bg-white/80'
              }`}
            >
              Settings
            </NavLink>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="activities" element={<AdminActivitiesPage />} />
          <Route path="calendar" element={<AdminCalendarPage />} />
          <Route path="requests" element={<AdminRequestsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="" element={<Navigate to="/dashboard/activities" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
