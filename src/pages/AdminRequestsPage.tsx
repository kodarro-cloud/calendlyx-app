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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-blue-50/60 border-l-4 border-l-blue-400 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-bold text-slate-800">{request.title}</h4>
                        </div>
                        
                        <div className="space-y-1 text-xs text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>👤</span>
                            <span className="font-medium">{request.requesterName}</span>
                          </div>
                          
                          {request.requesterPhone && (
                            <div className="flex items-center gap-1.5">
                              <span>📞</span>
                              <span className="font-medium">{request.requesterPhone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1.5 mt-2">
                            <span>📅</span>
                            <span className="font-medium">{request.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <span>⏰</span>
                            <span>{request.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} → {request.endDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          </div>
                          
                          {request.location && (
                            <div className="flex items-center gap-1.5">
                              <span>📍</span>
                              <span className="font-medium">{request.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {request.description && (
                          <div className="mt-2 p-2 bg-white/60 rounded border border-blue-200">
                            <p className="text-xs text-slate-700 line-clamp-2">{request.description}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t border-blue-200">
                        <button
                          onClick={() => request.id && handleApprove(request)}
                          disabled={processingId === request.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          title="Approve and create activity"
                        >
                          {processingId === request.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Check size={14} />
                              <span>Approve</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => request.id && handleReject(request.id)}
                          disabled={processingId === request.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg transition duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          title="Reject request"
                        >
                          {processingId === request.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <X size={14} />
                              <span>Reject</span>
                            </>
                          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {reviewedRequests.map((request) => (
                  <div key={request.id} className="bg-blue-50/60 rounded-lg p-3 border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-slate-800 text-sm">{request.title}</h4>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full shadow-sm ${
                            request.status === 'approved' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>📅</span>
                            <span className="font-medium">{request.startDate.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>⏰</span>
                            <span className="font-medium">{request.startDate.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>👤</span>
                            <span className="font-medium">{request.requesterName}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => request.id && handleDelete(request.id)}
                        disabled={processingId === request.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs mt-2 pt-2 border-t border-slate-200"
                        title="Delete request"
                      >
                        {processingId === request.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </>
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
