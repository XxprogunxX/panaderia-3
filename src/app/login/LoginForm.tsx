'use client';
import { useState } from 'react';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envío del formulario aquí
  };

  return (
    <div className={`${styles.container} ${rightPanelActive ? styles.rightPanelActive : ''}`}>
      {/* Sign Up Form */}
      <div className={`${styles.container__form} ${styles.containerSignup}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.form__title}>Crear Cuenta</h2>
          <input type="text" placeholder="Usuario" className={styles.input} required />
          <input type="email" placeholder="Email" className={styles.input} required />
          <input type="password" placeholder="Contraseña" className={styles.input} required />
          <button type="submit" className={styles.btn}>Registrarse</button>
        </form>
      </div>

      {/* Sign In Form */}
      <div className={`${styles.container__form} ${styles.containerSignin}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.form__title}>Iniciar Sesión</h2>
          <input type="email" placeholder="Email" className={styles.input} required />
          <input type="password" placeholder="Contraseña" className={styles.input} required />
          <a href="#" className={styles.link}>¿Olvidaste tu contraseña?</a>
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