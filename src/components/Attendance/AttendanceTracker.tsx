import React, { useState, useEffect } from 'react';
import { Users, Check, X } from 'lucide-react';
import { collection, query, getDocs, addDoc, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Event, User, Attendance } from '../../types';

const AttendanceTracker: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(false);

  const isUserSenior = currentUser?.role && ['EB', 'EC', 'Core'].includes(currentUser.role);

  useEffect(() => {
    if (isUserSenior) {
      fetchEvents();
      fetchUsers();
    }
  }, [isUserSenior]);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendance();
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'));
      const querySnapshot = await getDocs(q);
      const eventList: Event[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate()
      }));
      setEvents(eventList);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const userList: User[] = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('eventId', '==', selectedEventId)
      );
      const querySnapshot = await getDocs(q);
      const attendanceList: Attendance[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        markedAt: doc.data().markedAt.toDate()
      }));
      setAttendance(attendanceList);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (userId: string, status: 'Present' | 'Absent') => {
    if (!currentUser || !selectedEventId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'attendance'), {
        eventId: selectedEventId,
        userId,
        status,
        markedBy: currentUser.uid,
        markedAt: new Date()
      });
      
      fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
    setLoading(false);
  };

  const getAttendanceStatus = (userId: string) => {
    return attendance.find(att => att.userId === userId);
  };

  if (!isUserSenior) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Only EB/EC/Core members can access attendance tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance Tracker</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose an event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} - {event.date.toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedEventId && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h2>
          <div className="space-y-3">
            {users.map(user => {
              const attendanceRecord = getAttendanceStatus(user.uid);
              return (
                <div key={user.uid} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-500">{user.role} • {user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {attendanceRecord ? (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        attendanceRecord.status === 'Present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attendanceRecord.status}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => markAttendance(user.uid, 'Present')}
                          disabled={loading}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          <span>Present</span>
                        </button>
                        <button
                          onClick={() => markAttendance(user.uid, 'Absent')}
                          disabled={loading}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          <span>Absent</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;