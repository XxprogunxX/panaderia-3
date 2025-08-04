"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  setPersistence, 
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Configurar persistencia local (sesión dura hasta que se cierre manualmente o expire)
    const setupPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Persistencia configurada para mantener sesión activa');
      } catch (error) {
        console.error('❌ Error al configurar persistencia:', error);
      }
    };

    setupPersistence();

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔄 Estado de autenticación cambiado:', currentUser?.email || 'No autenticado');
      
      if (currentUser) {
        setUser(currentUser);
        
        // Obtener el rol del usuario desde Firestore
        try {
          const userDocRef = doc(db, "usuarios", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.rol || null);
            
            // Actualizar último login
            await updateDoc(userDocRef, {
              lastLogin: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            
            console.log('✅ Usuario autenticado con rol:', userData.rol);
          } else {
            console.warn('⚠️ Usuario no encontrado en Firestore');
            setUserRole(null);
          }
        } catch (error) {
          console.error('❌ Error al obtener datos del usuario:', error);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
        console.log('👋 Usuario desconectado');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Inicio de sesión exitoso:', userCredential.user.email);
    } catch (error) {
      console.error('❌ Error en inicio de sesión:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log('👋 Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 