import React from 'react';
import LoginForm from './LoginForm';
import Image from 'next/image';
export default function LoginPage() {
  return (
    
    <main

    
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundImage: 'url("/concha.jpg")', // Cambia esta ruta a la ubicación de tu imagen
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Agrega un efecto de superposición oscuro
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2, // Asegura que el formulario esté encima
        }}
      >
        <LoginForm />
      </div>
    </main>
  );
}
