import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { User, Task, Attendance, Feedback } from '../../types';
import CircularProgress from './CircularProgress';
import { useNavigate } from 'react-router-dom';

interface UserWithAnalytics extends User {
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  totalAttendance: number;
  attendedEvents: number;
  attendanceRate: number;
  totalFeedbacks: number;
}

const AllUsersAnalytics: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithAnalytics[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const isUserSenior = currentUser?.role && ['EB', 'EC'].includes(currentUser.role);

  useEffect(() => {
    if (isUserSenior) {
      fetchAllUsersAnalytics();
    }
  }, [isUserSenior]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const fetchAllUsersAnalytics = async () => {
    setLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersList: User[] = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        email: doc.data().email.toLowerCase(),
        name: doc.data().name,
        shortName: doc.data().shortName,
        role: doc.data().role,
        photoURL: doc.data().photoURL,
        createdAt: doc.data().createdAt.toDate()
      }));

      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
      const feedbackSnapshot = await getDocs(collection(db, 'feedback'));

      const usersWithAnalytics: UserWithAnalytics[] = usersList.map(user => {
        const userTasks = tasksSnapshot.docs.filter(doc =>
          doc.data().assignedToEmail === user.email
        );
        const completedTasks = userTasks.filter(doc =>
          doc.data().status === 'Completed'
        ).length;
        const totalTasks = userTasks.length;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const userAttendance = attendanceSnapshot.docs.filter(doc =>
          doc.data().userEmail === user.email
        );
        const attendedEvents = userAttendance.filter(doc =>
          doc.data().status === 'Present'
        ).length;
        const totalAttendance = userAttendance.length;
        const attendanceRate = totalAttendance > 0 ? (attendedEvents / totalAttendance) * 100 : 0;

        const totalFeedbacks = feedbackSnapshot.docs.filter(doc =>
          doc.data().userEmail === user.email
        ).length;

        return {
          ...user,
          totalTasks,
          completedTasks,
          taskCompletionRate,
          totalAttendance,
          attendedEvents,
          attendanceRate,
          totalFeedbacks
        };
      });

      usersWithAnalytics.sort((a, b) => {
        const roleOrder = { 'EB': 0, 'EC': 1, 'Core': 2, 'Member': 3 };
        return (roleOrder[a.role as keyof typeof roleOrder] || 4) - (roleOrder[b.role as keyof typeof roleOrder] || 4);
      });

      setUsers(usersWithAnalytics);
      setFilteredUsers(usersWithAnalytics);
    } catch (error) {
      console.error('Error fetching all users analytics:', error);
    }
    setLoading(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'EB': return 'bg-purple-600';
      case 'EC': return 'bg-blue-600';
      case 'Core': return 'bg-green-600';
      case 'Member': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  if (!isUserSenior) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-400">Only EB/EC members can access all users analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to My Analytics</span>
        </button>
        <div className="flex items-center space-x-3 mb-2">
          <UsersIcon className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">All Users Analytics</h1>
        </div>
        <p className="text-gray-400">View performance metrics for all society members</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Users</label>
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                           text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by name or email..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg
                         text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Roles</option>
              <option value="EB">EB</option>
              <option value="EC">EC</option>
              <option value="Core">Core</option>
              <option value="Member">Member</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.uid}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700
                         hover:border-blue-500 transition-all duration-300"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedUserId(expandedUserId === user.uid ? null : user.uid)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full
                                      flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{user.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">Tasks</p>
                        <p className="text-white font-semibold">{user.completedTasks}/{user.totalTasks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Attendance</p>
                        <p className="text-white font-semibold">{user.attendedEvents}/{user.totalAttendance}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Feedback</p>
                        <p className="text-white font-semibold">{user.totalFeedbacks}</p>
                      </div>
                    </div>
                    {expandedUserId === user.uid ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedUserId === user.uid && (
                <div className="border-t border-gray-700 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-4 text-center">Task Completion Rate</h4>
                      <div className="flex justify-center">
                        <CircularProgress
                          percentage={user.taskCompletionRate}
                          size={120}
                          strokeWidth={8}
                          color="#3b82f6"
                          backgroundColor="#1f2937"
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-4">
                        {user.completedTasks} completed out of {user.totalTasks} tasks
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-4 text-center">Attendance Rate</h4>
                      <div className="flex justify-center">
                        <CircularProgress
                          percentage={user.attendanceRate}
                          size={120}
                          strokeWidth={8}
                          color="#a855f7"
                          backgroundColor="#1f2937"
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-4">
                        {user.attendedEvents} attended out of {user.totalAttendance} events
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Task Performance</p>
                      <p className={`text-sm font-semibold ${
                        user.taskCompletionRate >= 75 ? 'text-green-400' :
                        user.taskCompletionRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {user.taskCompletionRate >= 75 ? 'Excellent' :
                         user.taskCompletionRate >= 50 ? 'Good' : 'Needs Improvement'}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Attendance</p>
                      <p className={`text-sm font-semibold ${
                        user.attendanceRate >= 80 ? 'text-green-400' :
                        user.attendanceRate >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {user.attendanceRate >= 80 ? 'Excellent' :
                         user.attendanceRate >= 60 ? 'Good' : 'Needs Improvement'}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">Feedback</p>
                      <p className={`text-sm font-semibold ${
                        user.totalFeedbacks >= 5 ? 'text-green-400' :
                        user.totalFeedbacks >= 3 ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {user.totalFeedbacks >= 5 ? 'Active' :
                         user.totalFeedbacks >= 3 ? 'Moderate' : 'Low'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllUsersAnalytics;
