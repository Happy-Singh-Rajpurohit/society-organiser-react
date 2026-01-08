import React, { useState } from 'react';
import { LogOut, Users, Home, CheckSquare, MessageSquare, UserCheck, GraduationCap, Activity, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import EditProfileModal from './Profile/EditProfileModal';

const Navbar: React.FC = () => {
  const { currentUser, logout, refreshUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleProfileUpdate = async () => {
    await refreshUser();
  };

  const isUserSenior = currentUser?.role && ['EB', 'EC', 'Core'].includes(currentUser.role);
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/analytics', icon: Activity, label: 'Analytics' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/academics', icon: GraduationCap, label: 'Academics' },
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
    <nav className="bg-gray-800 dark:bg-gray-800 bg-white shadow-lg border-b border-gray-700 dark:border-gray-700 border-gray-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-bold text-white dark:text-white text-gray-900">Society Sphere</h1>
            </Link>

            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 dark:text-gray-300 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center space-x-1 md:space-x-3">
              <button
                onClick={toggleTheme}
                className="flex items-center px-2 md:px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 rounded-md transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="hidden md:inline text-sm ml-1">{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <button
                onClick={() => setShowEditProfile(true)}
                className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors group"
                title="Edit Profile"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-gray-300">Welcome</span>
                  <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </button>

              <button
                onClick={() => setShowEditProfile(true)}
                className="md:hidden flex items-center px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                title="Edit Profile"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="h-7 w-7 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center px-2 md:px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline text-sm ml-1">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-700 dark:border-gray-700 border-gray-200 py-2">
          <div className="flex items-center justify-center space-x-1 overflow-x-auto">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-md text-xs font-medium transition-colors min-w-0 ${
                  location.pathname === path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 dark:text-gray-300 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showEditProfile && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          onProfileUpdated={handleProfileUpdate}
        />
      )}
    </nav>
  );
};
export default Navbar;
