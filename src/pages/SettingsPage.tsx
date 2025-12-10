import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeToActivityTypes, addActivityType, deleteActivityType, type ActivityType, subscribeToParticipants, addParticipant, deleteParticipant, type Participant, subscribeToDistricts, addDistrict, deleteDistrict, type District } from '../utils/firebaseUtils';

export const SettingsPage = () => {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newDistrictName, setNewDistrictName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribeTypes = subscribeToActivityTypes((types) => {
      setActivityTypes(types);
    });
    const unsubscribeParticipants = subscribeToParticipants((parts) => {
      setParticipants(parts);
    });
    const unsubscribeDistricts = subscribeToDistricts((dists) => {
      setDistricts(dists);
    });
    return () => {
      unsubscribeTypes();
      unsubscribeParticipants();
      unsubscribeDistricts();
    };
  }, []);

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTypeName.trim()) {
      toast.error('Type name is required');
      return;
    }

    // Check for duplicates
    if (activityTypes.some(t => t.name.toLowerCase() === newTypeName.trim().toLowerCase())) {
      toast.error('This type already exists');
      return;
    }

    setIsLoading(true);
    try {
      await addActivityType(newTypeName);
      toast.success('Activity type added successfully!');
      setNewTypeName('');
    } catch (error) {
      console.error('Error adding activity type:', error);
      toast.error('Failed to add activity type');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteType = async (id: string | undefined) => {
    if (!id) return;

    if (!window.confirm('Are you sure you want to delete this activity type?')) {
      return;
    }

    try {
      await deleteActivityType(id);
      toast.success('Activity type deleted successfully!');
    } catch (error) {
      console.error('Error deleting activity type:', error);
      toast.error('Failed to delete activity type');
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newParticipantName.trim()) {
      toast.error('Participant name is required');
      return;
    }

    // Check for duplicates
    if (participants.some(p => p.name.toLowerCase() === newParticipantName.trim().toLowerCase())) {
      toast.error('This participant already exists');
      return;
    }

    setIsLoading(true);
    try {
      await addParticipant(newParticipantName);
      toast.success('Participant added successfully!');
      setNewParticipantName('');
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Failed to add participant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteParticipant = async (id: string | undefined) => {
    if (!id) return;

    if (!window.confirm('Are you sure you want to delete this participant?')) {
      return;
    }

    try {
      await deleteParticipant(id);
      toast.success('Participant deleted successfully!');
    } catch (error) {
      console.error('Error deleting participant:', error);
      toast.error('Failed to delete participant');
    }
  };

  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDistrictName.trim()) {
      toast.error('District name is required');
      return;
    }

    // Check for duplicates
    if (districts.some(d => d.name.toLowerCase() === newDistrictName.trim().toLowerCase())) {
      toast.error('This district already exists');
      return;
    }

    setIsLoading(true);
    try {
      await addDistrict(newDistrictName);
      toast.success('District added successfully!');
      setNewDistrictName('');
    } catch (error) {
      console.error('Error adding district:', error);
      toast.error('Failed to add district');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDistrict = async (id: string | undefined) => {
    if (!id) return;

    if (!window.confirm('Are you sure you want to delete this district?')) {
      return;
    }

    try {
      await deleteDistrict(id);
      toast.success('District deleted successfully!');
    } catch (error) {
      console.error('Error deleting district:', error);
      toast.error('Failed to delete district');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-700 mb-1">Settings</h2>
        <p className="text-slate-600 text-sm">Manage activity configuration</p>
      </div>

      {/* Three-column grid for compact layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Types Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 border border-blue-100">
          <h3 className="text-base font-bold text-slate-700 mb-2">Activity Types</h3>
          <p className="text-slate-600 text-xs mb-3">Activity options</p>

          {/* Add New Type Form */}
          <form onSubmit={handleAddType} className="flex gap-1 mb-3">
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="New type..."
              className="flex-1 px-2 py-1.5 border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-300 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded text-xs font-medium"
              title="Add Type"
            >
              <Plus size={14} />
            </button>
          </form>

          {/* Activity Types List */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {activityTypes.length === 0 ? (
              <p className="text-center py-4 text-slate-400 text-xs">No types yet</p>
            ) : (
              activityTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-2 bg-white/60 border border-slate-200 rounded hover:shadow transition text-xs"
                >
                  <span className="font-medium text-slate-700">{type.name}</span>
                  <button
                    onClick={() => handleDeleteType(type.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 border border-blue-100">
          <h3 className="text-base font-bold text-slate-700 mb-2">Participants</h3>
          <p className="text-slate-600 text-xs mb-3">Participant names</p>

          {/* Add New Participant Form */}
          <form onSubmit={handleAddParticipant} className="flex gap-1 mb-3">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="New participant..."
              className="flex-1 px-2 py-1.5 border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-300 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded text-xs font-medium"
              title="Add Participant"
            >
              <Plus size={14} />
            </button>
          </form>

          {/* Participants List */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {participants.length === 0 ? (
              <p className="text-center py-4 text-slate-400 text-xs">No participants yet</p>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 bg-white/60 border border-slate-200 rounded hover:shadow transition text-xs"
                >
                  <span className="font-medium text-slate-700">{participant.name}</span>
                  <button
                    onClick={() => handleDeleteParticipant(participant.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Districts Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-4 border border-blue-100">
          <h3 className="text-base font-bold text-slate-700 mb-2">Districts</h3>
          <p className="text-slate-600 text-xs mb-3">District locations</p>

          {/* Add New District Form */}
          <form onSubmit={handleAddDistrict} className="flex gap-1 mb-3">
            <input
              type="text"
              value={newDistrictName}
              onChange={(e) => setNewDistrictName(e.target.value)}
              placeholder="New district..."
              className="flex-1 px-2 py-1.5 border border-blue-200 rounded text-xs focus:ring-1 focus:ring-blue-300 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded text-xs font-medium"
              title="Add District"
            >
              <Plus size={14} />
            </button>
          </form>

          {/* Districts List */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {districts.length === 0 ? (
              <p className="text-center py-4 text-slate-400 text-xs">No districts yet</p>
            ) : (
              districts.map((district) => (
                <div
                  key={district.id}
                  className="flex items-center justify-between p-2 bg-white/60 border border-slate-200 rounded hover:shadow transition text-xs"
                >
                  <span className="font-medium text-slate-700">{district.name}</span>
                  <button
                    onClick={() => handleDeleteDistrict(district.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">Tip:</span> Configure activity types, participants, and districts for quick activity creation.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
