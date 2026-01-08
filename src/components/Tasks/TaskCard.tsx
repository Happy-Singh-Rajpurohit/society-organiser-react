import React from 'react';
import { Calendar, User, Building, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onMarkComplete?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, canEdit, canDelete, onEdit, onDelete, onMarkComplete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Today': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Upcoming': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 
                    rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-6 
                    hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 
                    transition-all duration-300 group">
      
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
        <div className="flex space-x-1">
          {task.status !== 'Completed' && (
            <button
              onClick={() => {
                const completedTask = { ...task, status: 'Completed' as const };
                onMarkComplete?.(completedTask);
              }}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Mark as Complete"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => onEdit?.(task)}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Edit Task"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete?.(task.id)}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">{task.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 
                         dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
          {task.domain}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span>Due: {task.dueDate.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span>Created by {task.createdByName}</span>
        </div>
        {task.assignedToEmail && task.assignedToName && (
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span>Assigned to {task.assignedToName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
