import { doc, updateDoc, getDoc, increment, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const POINTS_CONFIG = {
  ATTENDANCE: 20,
  TASK_COMPLETION: 10,
  FEEDBACK: 10
};

export const addPoints = async (userEmail: string, points: number): Promise<void> => {
  try {
    const normalizedEmail = userEmail.toLowerCase();
    const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('User not found with email:', normalizedEmail);
      return;
    }

    const userDoc = querySnapshot.docs[0];
    await updateDoc(userDoc.ref, {
      points: increment(points)
    });
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
};

export const getUserPoints = async (userEmail: string): Promise<number> => {
  try {
    const normalizedEmail = userEmail.toLowerCase();
    const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return 0;
    }

    return querySnapshot.docs[0].data().points || 0;
  } catch (error) {
    console.error('Error fetching user points:', error);
    return 0;
  }
};
