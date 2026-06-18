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
  error: string | null;
}

export const useUser = (): UseUserReturn => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setError(null);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubscribeFirestore = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setUserData(snapshot.data() as User);
            } else {
              setUserData(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error("Firestore error:", err);
            setError("حدث خطأ في تحميل البيانات");
            setLoading(false);
          }
        );
        return () => unsubscribeFirestore();
      } else {
        setUserData(null);
        setLoading(false);
      }
    },
    (err) => {
      console.error("Auth error:", err);
      setError("حدث خطأ في المصادقة");
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  return {
    firebaseUser,
    userData,
    loading,
    isAuthenticated: !!firebaseUser,
    error,
  };
};