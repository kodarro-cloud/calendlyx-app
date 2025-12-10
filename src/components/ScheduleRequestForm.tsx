import { useState } from 'react';
import { X } from 'lucide-react';
import AddActivityForm from './AddActivityForm';

interface ScheduleRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleRequestForm = ({ isOpen, onClose, onSuccess }: ScheduleRequestFormProps) => {
  const [requesterName, setRequesterName] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');

  const handleActivityFormSuccess = async () => {
    // This will be called when AddActivityForm submits
    // The form data will be handled by AddActivityForm's submission
    onSuccess();
    onClose();
  };

  const handleActivityFormCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-blue-100 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-700">Request a Schedule</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition duration-200"
            title="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Requester Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
            {/* Requester Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm"
                required
              />
            </div>

            {/* Requester Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={requesterPhone}
                onChange={(e) => setRequesterPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm"
              />
            </div>
          </div>

          {/* Use the AddActivityForm component */}
          <AddActivityForm 
            isScheduleRequest={true}
            requesterName={requesterName}
            requesterPhone={requesterPhone}
            onSuccess={handleActivityFormSuccess}
            onCancel={handleActivityFormCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleRequestForm;
