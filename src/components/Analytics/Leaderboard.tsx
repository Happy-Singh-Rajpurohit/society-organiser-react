import React, { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { User } from '../../types';

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('points', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userList: User[] = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        email: doc.data().email,
        name: doc.data().name,
        shortName: doc.data().shortName,
        role: doc.data().role,
        photoURL: doc.data().photoURL,
        points: doc.data().points || 0,
        createdAt: doc.data().createdAt.toDate()
      }));
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-500';
    return '';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const isTopThree = (rank: number) => rank <= 3;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Global Leaderboard</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading leaderboard...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No users yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => {
            const rank = index + 1;
            const isTop = isTopThree(rank);
            const rankColor = getRankColor(rank);
            const rankIcon = getRankIcon(rank);

            return (
              <div
                key={user.uid}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 ${
                  isTop
                    ? `bg-gradient-to-r ${rankColor} text-white border-transparent shadow-lg`
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0 w-12">
                    <div className="text-xl font-bold flex items-center justify-center space-x-1">
                      {rankIcon && <span>{rankIcon}</span>}
                      {!rankIcon && <span className={isTop ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>{rank}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-1">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover border-2"
                        style={{ borderColor: isTop ? 'white' : undefined }}
                      />
                    ) : (
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center font-medium text-sm border-2 ${
                          isTop
                            ? 'bg-white/30 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isTop ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {user.name}
                      </p>
                      <p className={`text-xs ${isTop ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {user.role} • {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`text-right flex-shrink-0 ${isTop ? 'text-white' : ''}`}>
                  <div className={`text-2xl font-bold flex items-center space-x-1 ${isTop ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                    <span>{user.points || 0}</span>
                    <span className={`text-sm font-medium ${isTop ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                      pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How to Earn Points</h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>• Attend an event: +20 points</li>
          <li>• Complete a task: +10 points</li>
          <li>• Submit feedback: +10 points</li>
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;
