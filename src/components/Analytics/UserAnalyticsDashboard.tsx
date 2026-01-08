import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  CheckSquare,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Calendar,
  Award,
  Activity,
  Users,
  Trophy
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Task, Feedback, Attendance } from '../../types';
import CircularProgress from './CircularProgress';
import StatCard from './StatCard';
import AllUsersAnalytics from './AllUsersAnalytics';
import Leaderboard from './Leaderboard';

interface UserAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalAttendance: number;
  attendedEvents: number;
  totalFeedbacks: number;
  taskCompletionRate: number;
  attendanceRate: number;
}

const UserAnalyticsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-analytics' | 'leaderboard'>('my-analytics');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalAttendance: 0,
    attendedEvents: 0,
    totalFeedbacks: 0,
    taskCompletionRate: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserAnalytics();
    }
  }, [currentUser]);

  const fetchUserAnalytics = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedToEmail', '==', currentUser.email)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks: Task[] = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        description: doc.data().description,
        eventId: doc.data().eventId,
        domain: doc.data().domain,
        priority: doc.data().priority,
        status: doc.data().status,
        assignedToEmail: doc.data().assignedToEmail,
        assignedToName: doc.data().assignedToName,
        dueDate: doc.data().dueDate.toDate(),
        createdByEmail: doc.data().createdByEmail,
        createdByName: doc.data().createdByName,
        createdAt: doc.data().createdAt.toDate()
      }));

      const completedTasks = tasks.filter(task => task.status === 'Completed').length;
      const pendingTasks = tasks.filter(task => task.status !== 'Completed').length;
      const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userEmail', '==', currentUser.email)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceRecords: Attendance[] = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        eventId: doc.data().eventId,
        userEmail: doc.data().userEmail,
        userName: doc.data().userName,
        status: doc.data().status,
        markedByEmail: doc.data().markedByEmail,
        markedByName: doc.data().markedByName,
        markedAt: doc.data().markedAt.toDate()
      }));

      const attendedEvents = attendanceRecords.filter(record => record.status === 'Present').length;
      const totalAttendance = attendanceRecords.length;
      const attendanceRate = totalAttendance > 0 ? (attendedEvents / totalAttendance) * 100 : 0;

      const feedbackQuery = query(
        collection(db, 'feedback'),
        where('userEmail', '==', currentUser.email)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const totalFeedbacks = feedbackSnapshot.size;

      setAnalytics({
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        totalAttendance,
        attendedEvents,
        totalFeedbacks,
        taskCompletionRate,
        attendanceRate
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
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

  const isUserSenior = currentUser?.role && ['EB', 'EC'].includes(currentUser.role);

  if (showAllUsers && isUserSenior) {
    return <AllUsersAnalytics />;
  }

  if (loading && activeTab === 'my-analytics') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Track your progress and compete on the leaderboard</p>
          </div>
          {isUserSenior && (
            <button
              onClick={() => setShowAllUsers(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>View All Users</span>
            </button>
          )}
        </div>

        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('my-analytics')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'my-analytics'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>My Analytics</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'my-analytics' && (
        <>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900
                        rounded-xl shadow-lg border border-gray-700 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white dark:text-white mb-2">{currentUser?.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getRoleColor(currentUser?.role || 'Member')}`}>
                  {currentUser?.role}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300">
                  {currentUser?.email}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Member since {currentUser?.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Tasks"
            value={analytics.totalTasks}
            icon={CheckSquare}
            color="bg-blue-600"
            subtitle={`${analytics.pendingTasks} pending`}
          />
          <StatCard
            title="Completed Tasks"
            value={analytics.completedTasks}
            icon={Award}
            color="bg-green-600"
            subtitle={`${analytics.totalTasks - analytics.completedTasks} remaining`}
          />
          <StatCard
            title="Events Attended"
            value={`${analytics.attendedEvents}/${analytics.totalAttendance}`}
            icon={UserCheck}
            color="bg-purple-600"
            subtitle={analytics.totalAttendance > 0 ? `${Math.round(analytics.attendanceRate)}% attendance` : 'No events yet'}
          />
          <StatCard
            title="Feedback Given"
            value={analytics.totalFeedbacks}
            icon={MessageSquare}
            color="bg-orange-600"
            subtitle="Total submissions"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900
                          rounded-xl shadow-lg border border-gray-700 dark:border-gray-700 p-6
                          hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500
                          transition-all duration-300">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-white dark:text-white">Task Completion Rate</h3>
            </div>
            <div className="flex items-center justify-center">
              <CircularProgress
                percentage={analytics.taskCompletionRate}
                size={150}
                strokeWidth={10}
                color="#3b82f6"
                backgroundColor="#1f2937"
              />
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {analytics.completedTasks} completed out of {analytics.totalTasks} total tasks
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900
                          rounded-xl shadow-lg border border-gray-700 dark:border-gray-700 p-6
                          hover:shadow-xl hover:border-purple-500 dark:hover:border-purple-500
                          transition-all duration-300">
            <div className="flex items-center space-x-2 mb-6">
              <UserCheck className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-white dark:text-white">Attendance Rate</h3>
            </div>
            <div className="flex items-center justify-center">
              <CircularProgress
                percentage={analytics.attendanceRate}
                size={150}
                strokeWidth={10}
                color="#a855f7"
                backgroundColor="#1f2937"
              />
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {analytics.attendedEvents} attended out of {analytics.totalAttendance} total events
              </p>
            </div>
          </div>
        </div>
        </>
      )}

      {activeTab === 'leaderboard' && (
        <Leaderboard />
      )}
    </div>
  );
};

export default UserAnalyticsDashboard;
