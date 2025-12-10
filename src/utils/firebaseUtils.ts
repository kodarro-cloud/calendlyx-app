import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  Timestamp as FirestoreTimestamp,
  updateDoc,
  type DocumentData,
  type Query,
  type Timestamp as FirestoreTimestampType,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const Timestamp = FirestoreTimestamp;
export type TimestampType = FirestoreTimestampType;

export interface Activity extends DocumentData {
  id?: string;
  title: string;
  description: string;
  type?: string;
  startDate: FirestoreTimestampType;
  endDate: FirestoreTimestampType;
  location: string;
  isPublic: boolean;
  participant?: string;
  district?: string;
  createdAt?: FirestoreTimestampType;
  updatedAt?: FirestoreTimestampType;
}

export interface ActivityType extends DocumentData {
  id?: string;
  name: string;
  createdAt?: FirestoreTimestampType;
}

export interface Participant extends DocumentData {
  id?: string;
  name: string;
  createdAt?: FirestoreTimestampType;
}

export interface District extends DocumentData {
  id?: string;
  name: string;
  createdAt?: FirestoreTimestampType;
}

export interface ScheduleRequest extends DocumentData {
  id?: string;
  title: string;
  description?: string;
  type?: string;
  startDate: FirestoreTimestampType;
  endDate: FirestoreTimestampType;
  location?: string;
  requesterName: string;
  requesterEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: FirestoreTimestampType;
  updatedAt?: FirestoreTimestampType;
}

/**
 * Add a new activity to the Firestore collection
 * @param activity - Activity object without id
 * @returns Promise with the new document ID
 */
export const addActivity = async (activity: Omit<Activity, 'id'>): Promise<string> => {
  try {
    console.log('firebaseUtils: Adding activity:', activity);
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activity,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('firebaseUtils: Activity added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};

/**
 * Fetch all activities from Firestore
 * Optionally filter by public status
 * @param publicOnly - If true, only fetch public activities
 * @returns Promise with array of activities
 */
export const getActivities = async (publicOnly = false): Promise<Activity[]> => {
  try {
    let q: Query;

    if (publicOnly) {
      q = query(
        collection(db, 'activities'),
        where('isPublic', '==', true),
        orderBy('startDate', 'asc')
      );
    } else {
      q = query(
        collection(db, 'activities'),
        orderBy('startDate', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Activity));
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of activities
 * Returns unsubscribe function
 * @param publicOnly - If true, only listen to public activities
 * @param callback - Callback function called with activities array
 * @returns Unsubscribe function
 */
export const subscribeToActivities = (
  callback: (activities: Activity[]) => void,
  publicOnly = false
): (() => void) => {
  try {
    let q: Query;

    if (publicOnly) {
      q = query(
        collection(db, 'activities'),
        where('isPublic', '==', true),
        orderBy('startDate', 'asc')
      );
    } else {
      q = query(
        collection(db, 'activities'),
        orderBy('startDate', 'asc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log('firebaseUtils: Got snapshot with', querySnapshot.docs.length, 'activities');
        const activities = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Activity));
        callback(activities);
      },
      (error) => {
        console.error('firebaseUtils: Snapshot error:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to activities:', error);
    throw error;
  }
};

/**
 * Subscribe to activities on a specific date
 * @param date - The date to filter activities
 * @param callback - Callback function called with activities array
 * @param publicOnly - If true, only listen to public activities
 * @returns Unsubscribe function
 */
export const subscribeToActivitiesOnDate = (
  date: Date,
  callback: (activities: Activity[]) => void,
  publicOnly = false
): (() => void) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const constraints = [
      where('startDate', '<=', Timestamp.fromDate(endOfDay)),
      where('endDate', '>=', Timestamp.fromDate(startOfDay)),
      orderBy('startDate', 'asc'),
    ];

    if (publicOnly) {
      constraints.push(where('isPublic', '==', true));
    }

    const q = query(collection(db, 'activities'), ...constraints);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Activity));
      callback(activities);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to activities on date:', error);
    throw error;
  }
};

/**
 * Delete an activity from Firestore
 * @param id - The activity document ID
 * @returns Promise that resolves when deleted
 */
export const deleteActivity = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'activities', id));
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

/**
 * Add a new activity type
 * @param name - Activity type name
 * @returns Promise with the new document ID
 */
export const addActivityType = async (name: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'activityTypes'), {
      name: name.trim(),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding activity type:', error);
    throw error;
  }
};

/**
 * Fetch all activity types
 * @returns Promise with array of activity types
 */
export const getActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    const q = query(
      collection(db, 'activityTypes'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as ActivityType));
  } catch (error) {
    console.error('Error fetching activity types:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of activity types
 * @param callback - Callback function called with activity types array
 * @returns Unsubscribe function
 */
export const subscribeToActivityTypes = (
  callback: (types: ActivityType[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, 'activityTypes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const types = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as ActivityType));
      callback(types);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to activity types:', error);
    throw error;
  }
};

/**
 * Delete an activity type
 * @param id - The activity type document ID
 * @returns Promise that resolves when deleted
 */
export const deleteActivityType = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'activityTypes', id));
  } catch (error) {
    console.error('Error deleting activity type:', error);
    throw error;
  }
};

/**
 * Add a new participant
 * @param name - Participant name
 * @returns Promise with the new document ID
 */
export const addParticipant = async (name: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'participants'), {
      name: name.trim(),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
};

/**
 * Fetch all participants
 * @returns Promise with array of participants
 */
export const getParticipants = async (): Promise<Participant[]> => {
  try {
    const q = query(
      collection(db, 'participants'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Participant));
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of participants
 * @param callback - Callback function called with participants array
 * @returns Unsubscribe function
 */
export const subscribeToParticipants = (
  callback: (participants: Participant[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, 'participants'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const participants = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Participant));
      callback(participants);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to participants:', error);
    throw error;
  }
};

/**
 * Delete a participant
 * @param id - The participant document ID
 * @returns Promise that resolves when deleted
 */
export const deleteParticipant = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'participants', id));
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
};

/**
 * Update an activity
 * @param id - Activity document ID
 * @param activity - Updated activity data
 * @returns Promise that resolves when updated
 */
export const updateActivity = async (id: string, activity: Partial<Omit<Activity, 'id'>>): Promise<void> => {
  try {
    console.log('firebaseUtils: Updating activity:', id, activity);
    const docRef = doc(db, 'activities', id);
    const updateData = {
      ...activity,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(docRef, updateData);
    console.log('firebaseUtils: Activity updated');
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

/**
 * Add a new district
 * @param name - District name
 * @returns Promise with the new document ID
 */
export const addDistrict = async (name: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'districts'), {
      name: name.trim(),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding district:', error);
    throw error;
  }
};

/**
 * Fetch all districts
 * @returns Promise with array of districts
 */
export const getDistricts = async (): Promise<District[]> => {
  try {
    const q = query(
      collection(db, 'districts'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as District));
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of districts
 * @param callback - Callback function called with districts array
 * @returns Unsubscribe function
 */
export const subscribeToDistricts = (
  callback: (districts: District[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, 'districts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const districts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as District));
      callback(districts);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to districts:', error);
    throw error;
  }
};

/**
 * Add a new schedule request
 * @param request - ScheduleRequest object without id
 * @returns Promise with the new document ID
 */
export const addScheduleRequest = async (request: Omit<ScheduleRequest, 'id'>): Promise<string> => {
  try {
    console.log('firebaseUtils: Adding schedule request:', request);
    const docRef = await addDoc(collection(db, 'scheduleRequests'), {
      ...request,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('firebaseUtils: Schedule request added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding schedule request:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of schedule requests
 * @param callback - Callback function called with requests array
 * @returns Unsubscribe function
 */
export const subscribeToScheduleRequests = (
  callback: (requests: ScheduleRequest[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, 'scheduleRequests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        console.log('firebaseUtils: Got snapshot with', querySnapshot.docs.length, 'schedule requests');
        const requests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as ScheduleRequest));
        callback(requests);
      },
      (error) => {
        console.error('firebaseUtils: Snapshot error:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to schedule requests:', error);
    throw error;
  }
};

/**
 * Update schedule request status
 * @param id - Request ID
 * @param status - New status
 * @returns Promise
 */
export const updateScheduleRequestStatus = async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
  try {
    await updateDoc(doc(db, 'scheduleRequests', id), {
      status,
      updatedAt: Timestamp.now(),
    });
    console.log('firebaseUtils: Schedule request updated:', id);
  } catch (error) {
    console.error('Error updating schedule request:', error);
    throw error;
  }
};

/**
 * Delete a schedule request
 * @param id - Request ID
 * @returns Promise
 */
export const deleteScheduleRequest = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'scheduleRequests', id));
    console.log('firebaseUtils: Schedule request deleted:', id);
  } catch (error) {
    console.error('Error deleting schedule request:', error);
    throw error;
  }
};

/**
 * Delete a district
 * @param id - The district document ID
 * @returns Promise that resolves when deleted
 */
export const deleteDistrict = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'districts', id));
  } catch (error) {
    console.error('Error deleting district:', error);
    throw error;
  }
};
