'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebaseConfig';
import styles from './LoginForm.module.css';
import Link from 'next/link';
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ADMIN_EMAILS = ["admin11@gmail.com"];

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
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileForm, setMobileForm] = useState<'login' | 'register'>('login');
  const router = useRouter();

  // Detecta si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const rolAsignado = ADMIN_EMAILS.includes(user.email || "") ? "admin" : "usuario";
      
      // Crear documento en Firestore
      try {
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
          rol: rolAsignado
        });
        
        // Verificar que el documento se creó correctamente
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          throw new Error("No se pudo crear el documento del usuario en la base de datos");
        }
        
        console.log("Usuario creado exitosamente:", user.uid, "Rol:", rolAsignado);
        router.push('/');
        
      } catch (firestoreError) {
        // Si falla la creación en Firestore, eliminar el usuario de Auth
        console.error('Error al crear documento en Firestore:', firestoreError);
        await user.delete();
        setError('Error al crear el perfil del usuario. Por favor intenta nuevamente.');
      }
      
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
      
      console.log("Usuario autenticado:", user.uid, user.email);
      
      // Consulta el documento del usuario en Firestore
      const userDocRef = doc(db, "usuarios", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error("Documento de usuario no encontrado para UID:", user.uid);
        setError("No se encontró información de usuario. Esto puede ocurrir si el usuario fue creado pero no se guardó correctamente en la base de datos. Contacta al administrador.");
        await auth.signOut();
        return;
      }

      const userData = userDocSnap.data();
      console.log("Datos del usuario encontrados:", userData);
      
      if (userData.rol !== "admin") {
        setError("Tu cuenta no tiene permisos para acceder al panel de control. Solo los administradores pueden acceder.");
        await auth.signOut();
        return;
      }

      console.log("Acceso concedido al panel de control para:", user.email);
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
    <div className="login-page">
      <div className={`${styles.container} ${rightPanelActive ? styles.rightPanelActive : ''}`}>
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

        {/* MOBILE: solo un formulario visible, sin overlay */}
        <div className={styles.mobileOnly}>
          {mobileForm === 'login' && (
            <form onSubmit={handleSignIn} className={styles.form}>
              <h2 className={styles.form__title}>Iniciar Sesión</h2>
              <input 
                type="email" 
                placeholder="Email" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <button type="button" className={styles.btn} onClick={() => setMobileForm('register')}>
                Crear cuenta
              </button>
            </form>
          )}
          {mobileForm === 'register' && (
            <form onSubmit={handleSignUp} className={styles.form}>
              <h2 className={styles.form__title}>Crear Cuenta</h2>
              <input 
                type="text" 
                placeholder="Usuario" 
                className={styles.input} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                disabled={isLoading}
              />
              <input 
                type="email" 
                placeholder="Email" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <button type="button" className={styles.btn} onClick={() => setMobileForm('login')}>
                Iniciar Sesión
              </button>
            </form>
          )}
        </div>

        {/* DESKTOP: diseño original con overlay y dos paneles */}
        <div className={styles.desktopOnly}>
          <div className={`${styles.container__form} ${styles.containerSignup}`}>
            <form onSubmit={handleSignUp} className={styles.form}>
              <h2 className={styles.form__title}>Crear Cuenta</h2>
              <input 
                type="text" 
                placeholder="Usuario" 
                className={styles.input} 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                disabled={isLoading}
              />
              <input 
                type="email" 
                placeholder="Email" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className={`${styles.container__form} ${styles.containerSignin}`}>
            <form onSubmit={handleSignIn} className={styles.form}>
              <h2 className={styles.form__title}>Iniciar Sesión</h2>
              <input 
                type="email" 
                placeholder="Email" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
      </div>
    </div>
  );
}
