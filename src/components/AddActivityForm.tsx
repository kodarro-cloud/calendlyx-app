import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addActivity, updateActivity, subscribeToActivityTypes, type ActivityType, subscribeToParticipants, type Participant, subscribeToDistricts, type District, type Activity, subscribeToActivities, addScheduleRequest } from '../utils/firebaseUtils';
import { Timestamp } from 'firebase/firestore';

interface AddActivityFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  activity?: Activity;
  isScheduleRequest?: boolean;
  requesterName?: string;
  requesterPhone?: string;
}

export const AddActivityForm = ({ onSuccess, onCancel, activity, isScheduleRequest = false, requesterName = '', requesterPhone = '' }: AddActivityFormProps) => {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [customType, setCustomType] = useState('');
  const [showCustomType, setShowCustomType] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    activityName: '',
    description: '',
    participant: '',
    district: '',
    // Day 1
    day1Date: '',
    day1StartTime: '09:00',
    day1EndTime: '10:00',
    // Day 2
    day2Date: '',
    day2StartTime: '09:00',
    day2EndTime: '10:00',
    // Day 3
    day3Date: '',
    day3StartTime: '09:00',
    day3EndTime: '10:00',
    location: '',
    isPublic: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Format date to YYYY-MM-DD in local time to avoid timezone shifts
  const toInputDate = (date: Date) => {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  };

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
    const unsubscribeActivities = subscribeToActivities((acts) => {
      setAllActivities(acts);
    });
    
    // If editing an existing activity, populate the form
    if (activity) {
      const startDate = new Date(activity.startDate.toDate());
      const endDate = new Date(activity.endDate.toDate());
      
      setFormData({
        activityName: activity.title,
        description: activity.description,
        participant: activity.participant || '',
        district: activity.district || '',
        day1Date: toInputDate(startDate),
        day1StartTime: startDate.toTimeString().slice(0, 5),
        day1EndTime: endDate.toTimeString().slice(0, 5),
        day2Date: '',
        day2StartTime: '09:00',
        day2EndTime: '10:00',
        day3Date: '',
        day3StartTime: '09:00',
        day3EndTime: '10:00',
        location: activity.location,
        isPublic: activity.isPublic,
      });
      setCustomType(activity.title);
    }
    
    return () => {
      unsubscribeTypes();
      unsubscribeParticipants();
      unsubscribeDistricts();
      unsubscribeActivities();
    };
  }, [activity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.activityName.trim() && !customType.trim()) {
      toast.error('Activity Name is required');
      return false;
    }
    if (!formData.day1Date || !formData.day1StartTime || !formData.day1EndTime) {
      toast.error('Day 1: Date, Start Time, and End Time are required');
      return false;
    }
    if (eventDays >= 2 && (!formData.day2Date || !formData.day2StartTime || !formData.day2EndTime)) {
      toast.error('Day 2: Date, Start Time, and End Time are required');
      return false;
    }
    if (eventDays === 3 && (!formData.day3Date || !formData.day3StartTime || !formData.day3EndTime)) {
      toast.error('Day 3: Date, Start Time, and End Time are required');
      return false;
    }
    return true;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hours = 6; hours <= 22; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const displayHours = hours % 12 || 12;
        const ampm = hours < 12 ? 'AM' : 'PM';
        const displayTime = `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
        options.push({ value: timeStr, display: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Helper function to check if a date has activities
  const getActivityDates = () => {
    return allActivities.map(act => {
      const start = new Date(act.startDate.toDate());
      return start.toDateString();
    });
  };

  // Helper function to highlight dates with activities
  const getDayClassName = (date: Date) => {
    const activityDates = getActivityDates();
    const dateStr = date.toDateString();
    
    // Check if date is in selected range
    if (selectedStartDate && selectedEndDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const current = new Date(date);
      current.setHours(0, 0, 0, 0);
      
      if (current >= start && current <= end) {
        return 'bg-green-200 font-bold text-green-800';
      }
    } else if (selectedStartDate && dateStr === selectedStartDate.toDateString()) {
      return 'bg-green-300 font-bold text-green-900 ring-2 ring-green-500';
    }
    
    if (activityDates.includes(dateStr)) {
      return 'bg-blue-100 font-bold text-blue-600';
    }
    return '';
  };

  // Activities scheduled on a specific calendar day
  const getActivitiesOnDate = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return allActivities.filter((activity) => {
      const start = activity.startDate.toDate();
      const end = activity.endDate.toDate();
      return start <= dayEnd && end >= dayStart;
    });
  };

  const handleCalendarDateClick = (date: Date | null) => {
    if (!date) return;
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setFormData(prev => ({
        ...prev,
        day1Date: toInputDate(date),
        day2Date: '',
        day3Date: '',
      }));
    } else {
      // Complete selection
      let start = selectedStartDate;
      let end = date;
      
      // Swap if end is before start
      if (end < start) {
        [start, end] = [date, selectedStartDate];
      }
      
      setSelectedStartDate(start);
      setSelectedEndDate(end);
      
      // Calculate all dates in range
      const dates: string[] = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(toInputDate(current));
        current.setDate(current.getDate() + 1);
      }
      
      setFormData(prev => ({
        ...prev,
        day1Date: dates[0] || '',
        day2Date: dates[1] || '',
        day3Date: dates[2] || '',
      }));
    }
  };

  // Calculate eventDays dynamically from selected dates
  const eventDays = selectedStartDate && selectedEndDate 
    ? Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  const selectedDateForSchedule = selectedEndDate ?? selectedStartDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const activityName = (showCustomType && customType.trim()) ? customType.trim() : formData.activityName;

      // Calculate start and end dates/times based on event days
      let startDate: Date, endDate: Date;

      if (eventDays === 1) {
        startDate = new Date(`${formData.day1Date}T${formData.day1StartTime}`);
        endDate = new Date(`${formData.day1Date}T${formData.day1EndTime}`);
      } else if (eventDays === 2) {
        startDate = new Date(`${formData.day1Date}T${formData.day1StartTime}`);
        endDate = new Date(`${formData.day2Date}T${formData.day2EndTime}`);
      } else {
        startDate = new Date(`${formData.day1Date}T${formData.day1StartTime}`);
        endDate = new Date(`${formData.day3Date}T${formData.day3EndTime}`);
      }

      console.log('AddActivityForm: Submitting with:', {
        title: activityName.trim(),
        type: activityName.trim(),
        startDate,
        endDate,
        days: eventDays,
        isScheduleRequest,
      });

      if (isScheduleRequest) {
        // Save as schedule request for admin approval
        const requestData = {
          title: activityName.trim(),
          description: formData.description.trim(),
          type: activityName.trim(),
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          location: formData.location.trim(),
          requesterName: requesterName,
          requesterPhone: requesterPhone,
          status: 'pending' as const,
        };
        
        await addScheduleRequest(requestData);
        toast.success('Schedule request submitted! Waiting for admin approval.');
      } else {
        // Save as regular activity
        const activityData = {
          title: activityName.trim(),
          description: formData.description.trim(),
          type: activityName.trim(),
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          location: formData.location.trim(),
          participant: formData.participant,
          district: formData.district,
          isPublic: formData.isPublic,
        };

        if (activity && activity.id) {
          // Edit mode
          await updateActivity(activity.id, activityData);
          toast.success('Activity updated successfully!');
        } else {
          // Add mode
          await addActivity(activityData);
          toast.success('Activity added successfully!');
        }
      }

      setFormData({
        activityName: '',
        description: '',
        participant: '',
        district: '',
        day1Date: '',
        day1StartTime: '09:00',
        day1EndTime: '10:00',
        day2Date: '',
        day2StartTime: '09:00',
        day2EndTime: '10:00',
        day3Date: '',
        day3StartTime: '09:00',
        day3EndTime: '10:00',
        location: '',
        isPublic: true,
      });
      setCustomType('');
      setShowCustomType(false);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error(isScheduleRequest ? 'Failed to submit request. Please try again.' : 'Failed to add activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Two Column Layout: Form on Left, Calendar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form Fields */}
        <div className="space-y-4">
          {/* Row 1: Activity Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name *</label>
            <div className="flex gap-2">
              <select
                name="activityName"
                value={formData.activityName}
                onChange={handleInputChange}
                className="flex-1 pl-3 pr-10 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                disabled={isLoading || showCustomType}
              >
                <option value="">Select activity...</option>
                {activityTypes.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCustomType(!showCustomType)}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium"
                title="Add custom activity name"
              >
                +
              </button>
            </div>
            {showCustomType && (
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom activity name"
                className="w-full px-3 py-2 border border-blue-200 rounded-lg mt-2 text-sm"
                disabled={isLoading}
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Activity description" rows={2} className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm resize-none" disabled={isLoading} />
          </div>

          {/* Participant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participant</label>
            <select name="participant" value={formData.participant} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat" disabled={isLoading}>
              <option value="">Select participant (optional)...</option>
              {participants.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select name="district" value={formData.district} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat" disabled={isLoading}>
              <option value="">Select district (optional)...</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Activity location" className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 text-sm" disabled={isLoading} />
          </div>

          {/* Time Settings - Show when date is selected */}
          {selectedStartDate && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3 max-h-96 overflow-y-auto">
              <h4 className="font-semibold text-sm text-slate-700 sticky top-0 bg-blue-50 pb-2">
                {selectedEndDate ? `Event: ${eventDays} Day${eventDays > 1 ? 's' : ''}` : 'Select End Date'}
              </h4>
              
              {/* Day 1 Times */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">
                  Day 1: {selectedStartDate.toLocaleDateString()}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Time *</label>
                      <select name="day1StartTime" value={formData.day1StartTime} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2 border border-blue-200 rounded-lg text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat" disabled={isLoading}>
                      {timeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.display}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Time *</label>
                      <select name="day1EndTime" value={formData.day1EndTime} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2 border border-blue-200 rounded-lg text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat" disabled={isLoading}>
                      {timeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.display}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Day 2 Times */}
              {eventDays >= 2 && formData.day2Date && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">
                    Day 2: {new Date(formData.day2Date).toLocaleDateString()}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Time *</label>
                      <select name="day2StartTime" value={formData.day2StartTime} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2 border border-blue-200 rounded-lg text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat" disabled={isLoading}>
                        {timeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.display}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Time *</label>
                      <select name="day2EndTime" value={formData.day2EndTime} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2 border border-blue-200 rounded-lg text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat" disabled={isLoading}>
                        {timeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.display}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Day 3 Times */}
              {eventDays >= 3 && formData.day3Date && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">
                    Day 3: {new Date(formData.day3Date).toLocaleDateString()}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Time *</label>
                      <select name="day3StartTime" value={formData.day3StartTime} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2 border border-blue-200 rounded-lg text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat" disabled={isLoading}>
                        {timeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.display}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Time *</label>
                      <select name="day3EndTime" value={formData.day3EndTime} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2 border border-blue-200 rounded-lg text-sm bg-white cursor-pointer hover:border-blue-300 transition appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat" disabled={isLoading}>
                        {timeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.display}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional days beyond 3 - show count only */}
              {eventDays > 3 && (
                <div className="bg-blue-100 p-2 rounded text-xs text-center text-blue-800">
                  + {eventDays - 3} more day{eventDays - 3 > 1 ? 's' : ''} (using Day 3 times)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Calendar */}
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-3 rounded-xl border-2 border-blue-200 h-full flex flex-col">
          <div className="mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 mb-1">Select Date(s)</h3>
            <p className="text-xs text-slate-600">
              {!selectedStartDate ? 'Click a date to start' : 
               !selectedEndDate ? 'Click another date to set range' :
               `Selected: ${eventDays} day${eventDays > 1 ? 's' : ''}`}
            </p>
            {selectedStartDate && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStartDate(null);
                  setSelectedEndDate(null);
                  setFormData(prev => ({ ...prev, day1Date: '', day2Date: '', day3Date: '' }));
                }}
                className="mt-1.5 text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>
          <div className="flex-1 flex items-stretch">
            <DatePicker
              selected={selectedStartDate}
              onChange={handleCalendarDateClick}
              dateFormat="yyyy-MM-dd"
              dayClassName={getDayClassName}
              inline
              calendarClassName="!border-0 !shadow-none !bg-transparent !w-full !min-w-full"
              wrapperClassName="w-full"
              disabled={isLoading}
            />
          </div>
          <div className="mt-2 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-slate-600">Has activities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
              <span className="text-slate-600">Selected range</span>
            </div>
          </div>

          {selectedDateForSchedule && (
            <div className="mt-4 bg-white/70 rounded-lg border border-blue-200 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-700">Bookings on {selectedDateForSchedule.toLocaleDateString()}</p>
                <span className="text-[11px] text-slate-500">Live view</span>
              </div>
              {getActivitiesOnDate(selectedDateForSchedule).length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {getActivitiesOnDate(selectedDateForSchedule).map((act) => {
                    const start = act.startDate.toDate();
                    const end = act.endDate.toDate();
                    const startStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    const endStr = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                    return (
                      <div key={act.id} className="p-2 rounded border border-blue-100 bg-blue-50 text-slate-700">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800 text-[13px] truncate">{act.title}</span>
                          <span className="text-[11px] text-blue-700">{startStr} - {endStr}</span>
                        </div>
                        {act.location && <p className="text-[11px] text-slate-600 mt-0.5 truncate">📍 {act.location}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-[12px]">No bookings on this date</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-blue-100">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isLoading} 
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition duration-200"
        >
          {activity ? 'Cancel' : 'Clear'}
        </button>
        <button 
          type="submit" 
          disabled={isLoading || !selectedStartDate} 
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {isScheduleRequest ? 'Submitting Request...' : (activity ? 'Updating Activity...' : 'Adding Activity...')}
            </span>
          ) : (
            isScheduleRequest ? '📤 Submit Request for Approval' : (activity ? '✏️ Update Activity' : '➕ Add New Activity')
          )}
        </button>
      </div>
    </form>
  );
};

export default AddActivityForm;
