"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "@/types";

interface UseUserReturn {
  firebaseUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useUser = (): UseUserReturn => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      if (user) {
        // الاشتراك في بيانات المستخدم من Firestore
        const userRef = doc(db, "users", user.uid);
        const unsubscribeFirestore = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.data() as User);
          }
          setLoading(false);
        });
        return () => unsubscribeFirestore();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return {
    firebaseUser,
    userData,
    loading,
    isAuthenticated: !!firebaseUser,
  };
};