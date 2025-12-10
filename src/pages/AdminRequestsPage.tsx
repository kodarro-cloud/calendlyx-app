import { useState, useEffect } from 'react';
import { Check, X, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ScheduleRequest, Activity } from '../utils/firebaseUtils';
import { subscribeToScheduleRequests, updateScheduleRequestStatus, deleteScheduleRequest, addActivity } from '../utils/firebaseUtils';

export const AdminRequestsPage = () => {
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToScheduleRequests((requests) => {
      setScheduleRequests(requests);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: ScheduleRequest) => {
    if (!request.id) return;
    
    setProcessingId(request.id);
    try {
      // Convert to Activity
      const activity: Omit<Activity, 'id'> = {
        title: request.title,
        description: request.description || '',
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        location: request.location || '',
        isPublic: true,
        participant: request.requesterName,
      };

      await addActivity(activity);
      await updateScheduleRequestStatus(request.id, 'approved');
      toast.success('Request approved and activity created!');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await updateScheduleRequestStatus(id, 'rejected');
      toast.success('Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    try {
      await deleteScheduleRequest(id);
      toast.success('Request deleted');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = scheduleRequests.filter(r => r.status === 'pending');
  const reviewedRequests = scheduleRequests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-700 mb-1">Schedule Requests</h2>
        <p className="text-slate-600 text-sm">
          Review and manage schedule requests · {pendingRequests.length} pending
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-600 mt-4">Loading requests...</p>
        </div>
      ) : pendingRequests.length === 0 && reviewedRequests.length === 0 ? (
        <div className="text-center py-12 bg-white/50 rounded-xl border-2 border-dashed border-blue-200">
          <p className="text-slate-600 font-medium">No requests yet</p>
          <p className="text-slate-500 text-sm mt-1">Requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">🔔 Pending Requests ({pendingRequests.length})</h3>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-yellow-50 border-l-4 border-l-yellow-400 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-slate-800">{request.title}</h4>
                          {request.type && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                              {request.type}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p><span className="font-medium">👤 Requester:</span> {request.requesterName}</p>
                          {request.requesterEmail && <p><span className="font-medium">📧 Email:</span> {request.requesterEmail}</p>}
                          <p><span className="font-medium">⏰ Time:</span> {request.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {request.endDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                          <p><span className="font-medium">📅 Date:</span> {request.startDate.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          {request.location && <p><span className="font-medium">📍 Location:</span> {request.location}</p>}
                          {request.description && <p className="mt-2 text-slate-700">{request.description}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => request.id && handleApprove(request)}
                          disabled={processingId === request.id}
                          className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-200 font-medium disabled:opacity-50"
                          title="Approve and create activity"
                        >
                          {processingId === request.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                        <button
                          onClick={() => request.id && handleReject(request.id)}
                          disabled={processingId === request.id}
                          className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 font-medium disabled:opacity-50"
                          title="Reject request"
                        >
                          {processingId === request.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <X size={16} />
                          )}
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed Requests */}
          {reviewedRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">✓ Reviewed Requests ({reviewedRequests.length})</h3>
              <div className="space-y-2">
                {reviewedRequests.map((request) => (
                  <div key={request.id} className={`rounded-lg p-4 border-l-4 shadow-sm ${
                    request.status === 'approved' ? 'bg-green-50 border-l-green-400' : 'bg-red-50 border-l-red-400'
                  }`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800">{request.title}</h4>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            request.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {request.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · 
                          {request.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={() => request.id && handleDelete(request.id)}
                        disabled={processingId === request.id}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition duration-200 font-medium disabled:opacity-50"
                        title="Delete request"
                      >
                        {processingId === request.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;
