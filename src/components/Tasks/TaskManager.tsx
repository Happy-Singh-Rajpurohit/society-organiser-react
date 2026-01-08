import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Task, Event } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { addPoints, POINTS_CONFIG } from '../../utils/pointsManager';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';

const TaskManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    domain: 'All',
    priority: 'All',
    status: 'All'
  });

  const isUserSenior = currentUser?.role && ['EB', 'EC', 'Core'].includes(currentUser.role);

  useEffect(() => {
    fetchTasks();
    fetchEvents();
  }, []);

  const fetchTasks = async () => {
    try {
      const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const taskList: Task[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      }));
      setTasks(taskList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
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

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleMarkComplete = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'Completed',
        updatedAt: new Date()
      });

      if (task.assignedToEmail) {
        await addPoints(task.assignedToEmail, POINTS_CONFIG.TASK_COMPLETION);
      }

      fetchTasks();
    } catch (error) {
      console.error('Error marking task as complete:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    return (
      (filters.domain === 'All' || task.domain === filters.domain) &&
      (filters.priority === 'All' || task.priority === filters.priority) &&
      (filters.status === 'All' || task.status === filters.status)
    );
  });

  const activeTasks = filteredTasks.filter(task => task.status !== 'Completed');
  const completedTasks = filteredTasks.filter(task => task.status === 'Completed');

  const domains = ['All', ...Array.from(new Set(tasks.map(task => task.domain)))];
  const priorities = ['All', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Upcoming', 'Today', 'Completed'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header & Add Task */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</h1>
        {isUserSenior && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800
                      rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-6 mb-6
                      hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain</label>
            <select
              value={filters.domain}
              onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 dark:text-gray-200
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 dark:text-gray-200
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 dark:text-gray-200
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Tasks Section */}
      {(filters.status === 'All' || filters.status !== 'Completed') && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Tasks</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {activeTasks.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No active tasks found.</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  canEdit={isUserSenior}
                  canDelete={isUserSenior}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onMarkComplete={handleMarkComplete}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Completed Tasks Section */}
      {(filters.status === 'All' || filters.status === 'Completed') && completedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Completed Tasks</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                canEdit={isUserSenior}
                canDelete={isUserSenior}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onMarkComplete={handleMarkComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isUserSenior && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          events={events}
          onTaskCreated={() => {
            fetchTasks();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit Task Modal */}
      {isUserSenior && (
        <EditTaskModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          events={events}
          onTaskUpdated={() => {
            fetchTasks();
            setShowEditModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskManager;
