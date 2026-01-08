import React, { useState, useEffect, useRef } from 'react';
import { Search, User as UserIcon, X } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { User } from '../../types';

interface UserAutoCompleteProps {
  value: string;
  onUserSelect: (email: string, name: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const UserAutoComplete: React.FC<UserAutoCompleteProps> = ({
  value,
  onUserSelect,
  placeholder = 'Start typing to search users...',
  label = 'Assign To',
  required = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = user.name.toLowerCase().includes(searchLower);
        const shortNameMatch = user.shortName?.toLowerCase().includes(searchLower);
        const emailMatch = user.email.toLowerCase().includes(searchLower);

        return nameMatch || shortNameMatch || emailMatch;
      });
      setFilteredUsers(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredUsers([]);
      setShowDropdown(false);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const userList: User[] = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        email: doc.data().email.toLowerCase(),
        name: doc.data().name,
        shortName: doc.data().shortName,
        role: doc.data().role,
        createdAt: doc.data().createdAt.toDate()
      }));
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm('');
    setShowDropdown(false);
    onUserSelect(user.email, user.name);
  };

  const handleClear = () => {
    setSelectedUser(null);
    setSearchTerm('');
    onUserSelect('', '');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (selectedUser) {
      setSelectedUser(null);
      onUserSelect('', '');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} {!required && <span className="text-gray-500 text-xs">(Optional)</span>}
        </label>
      )}

      {selectedUser ? (
        <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-800 flex items-center justify-between
                        focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {selectedUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedUser.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {selectedUser.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchTerm.length > 0 && filteredUsers.length > 0) {
                setShowDropdown(true);
              }
            }}
            className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder}
            required={required}
          />
        </div>
      )}

      {showDropdown && filteredUsers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                        rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredUsers.map(user => (
            <button
              key={user.uid}
              type="button"
              onClick={() => handleUserSelect(user)}
              className="w-full px-3 py-2 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700
                         transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  {user.shortName && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({user.shortName})
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium
                  ${user.role === 'EB' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                    user.role === 'EC' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    user.role === 'Core' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {user.role}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAutoComplete;
