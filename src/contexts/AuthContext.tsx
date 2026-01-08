import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string, role: User['role'], name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!.toLowerCase(),
            role: userData.role,
            name: userData.name,
            shortName: userData.shortName,
            photoURL: userData.photoURL,
            points: userData.points,
            createdAt: userData.createdAt.toDate()
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, role: User['role'], name: string) => {
    const normalizedEmail = email.toLowerCase();
    const { user } = await signInWithEmailAndPassword(auth, normalizedEmail, password);

    await setDoc(doc(db, 'users', user.uid), {
      name: name || user.email?.split('@')[0] || 'User',
      email: normalizedEmail,
      role,
      points: 0,
      createdAt: new Date()
    }, { merge: true });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!.toLowerCase(),
          role: userData.role,
          name: userData.name,
          shortName: userData.shortName,
          photoURL: userData.photoURL,
          points: userData.points,
          createdAt: userData.createdAt.toDate()
        });
      }
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};