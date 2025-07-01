'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import styles from './LoginForm.module.css';
import Link from 'next/link';
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ADMIN_EMAILS = ["oscar73986@gmail.com"];

export default function LoginForm() {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Solo para registro
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
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
      let errorMessage = 'Error al registrar';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      } else {
        errorMessage = String(error);
      }
      setError(errorMessage);
      console.error('Error al registrar:', error);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
        await auth.signOut();
        setError("Tu cuenta no tiene permisos para acceder al panel de control.");
        return;
      }
      router.push('/paneldecontrol');
    } catch (error: unknown) {
      let errorMessage = 'Error al iniciar sesión';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      } else {
        errorMessage = String(error);
      }
      setError(errorMessage);
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className={`${styles.container} ${rightPanelActive ? styles.rightPanelActive : ''}`}>
      {/* Mostrar errores */}
      {error && <div className={styles.error}>{error}</div>}

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
          />
          <input 
            type="email" 
            placeholder="Email" 
            className={styles.input} 
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className={styles.input} 
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required 
          />
          <button type="submit" className={styles.btn}>Registrarse</button>
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
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className={styles.input} 
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required 
          />
          <Link href="/recuperar-contrasena" className={styles.link}>¿Olvidaste tu contraseña?</Link>
          <button type="submit" className={styles.btn}>Ingresar</button>
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
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}