import React from 'react';
import { LogOut, Users, Home, CheckSquare, MessageSquare, UserCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const isUserSenior = currentUser?.role && ['EB', 'EC', 'Core'].includes(currentUser.role);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/feedback', icon: MessageSquare, label: 'Feedback' },
    ...(isUserSenior ? [{ path: '/attendance', icon: UserCheck, label: 'Attendance' }] : [])
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'EB': return 'bg-purple-100 text-purple-800';
      case 'EC': return 'bg-blue-100 text-blue-800';
      case 'Core': return 'bg-green-100 text-green-800';
      case 'Member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-white">Society Sphere</h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Welcome, {currentUser.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;