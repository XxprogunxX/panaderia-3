'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebaseConfig';
import styles from './LoginForm.module.css';
import Link from 'next/link';
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ADMIN_EMAILS = ["oscar73981@gmail.com"];

// Función para traducir errores de Firebase
const getErrorMessage = (error: FirebaseError): string => {
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos. Por favor verifica tus credenciales.';
    case 'auth/user-not-found':
      return 'No existe una cuenta con este email.';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por favor espera unos minutos antes de intentar nuevamente.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada.';
    case 'auth/invalid-email':
      return 'El formato del email no es válido.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este email.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu conexión a internet.';
    case 'auth/operation-not-allowed':
      return 'El inicio de sesión con email y contraseña no está habilitado.';
    default:
      return `Error: ${error.message}`;
  }
};

export default function LoginForm() {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Solo para registro
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Guarda el usuario en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username || null,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified,
        providerData: user.providerData,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rol: "usuario"
      });
      
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(getErrorMessage(error));
      } else {
        setError('Error inesperado al registrar. Por favor intenta nuevamente.');
      }
      console.error('Error al registrar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        await auth.signOut();
        setError("Tu cuenta no tiene permisos para acceder al panel de control. Solo los administradores pueden acceder.");
        return;
      }
      
      router.push('/paneldecontrol');
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(getErrorMessage(error));
      } else {
        setError('Error inesperado al iniciar sesión. Por favor intenta nuevamente.');
      }
      console.error('Error al iniciar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${rightPanelActive ? styles.rightPanelActive : ''}`}>
      {/* Mostrar errores */}
      {error && (
        <div className={styles.error}>
          {error}
          <button 
            onClick={() => setError('')} 
            className={styles.errorClose}
            aria-label="Cerrar error"
          >
            ×
          </button>
        </div>
      )}

      {/* Sign Up Form */}
      <div className={`${styles.container__form} ${styles.containerSignup}`}>
        <form onSubmit={handleSignUp} className={styles.form}>
          <h2 className={styles.form__title}>Crear Cuenta</h2>
          <input 
            type="text" 
            placeholder="Usuario" 
            className={styles.input} 
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required 
            disabled={isLoading}
          />
          <input 
            type="email" 
            placeholder="Email" 
            className={styles.input} 
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required 
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className={styles.input} 
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required 
            disabled={isLoading}
            minLength={6}
          />
          <button 
            type="submit" 
            className={styles.btn}
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className={`${styles.container__form} ${styles.containerSignin}`}>
        <form onSubmit={handleSignIn} className={styles.form}>
          <h2 className={styles.form__title}>Iniciar Sesión</h2>
          <input 
            type="email" 
            placeholder="Email" 
            className={styles.input} 
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required 
            disabled={isLoading}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className={styles.input} 
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required 
            disabled={isLoading}
          />
          <Link href="/recuperar-contrasena" className={styles.link}>¿Olvidaste tu contraseña?</Link>
          <button 
            type="submit" 
            className={styles.btn}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>

      {/* Overlay */}
      <div className={styles.container__overlay}>
        <div className={styles.overlay}>
          <div className={`${styles.overlay__panel} ${styles.overlayLeft}`}>
            <h2>¡Bienvenido de vuelta!</h2>
            <p>Ingresa tus datos para acceder a tu cuenta</p>
            <button 
              onClick={() => setRightPanelActive(false)} 
              className={styles.btn}
              disabled={isLoading}
            >
              Iniciar Sesión
            </button>
          </div>
          <div className={`${styles.overlay__panel} ${styles.overlayRight}`}>
            <h2>¡Hola!</h2>
            <p>Regístrate para comenzar tu experiencia</p>
            <button 
              onClick={() => setRightPanelActive(true)} 
              className={styles.btn}
              disabled={isLoading}
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}