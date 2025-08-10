"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Carrito from "./Carrito";
import { useCarrito } from "./CarritoContext";
import LoginButton from "./LoginButton";

const CafeHeader = () => {
  const { productos } = useCarrito();
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleCarrito = () => setMostrarCarrito(!mostrarCarrito);
  const toggleMenu = () => setMenuAbierto((prev) => !prev);
  const closeMenu = () => setMenuAbierto(false);

  // Evitar scroll del fondo cuando el menú está abierto
  useEffect(() => {
    if (menuAbierto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  return (
    <>
      <header className="cafe-header">
        <div className="cafe-logo-section">
          <Link href="/cafe" className="cafe-nav-link">
            Cafetería
          </Link>
          <div className="cafe-brand">
            <div className="cafe-logo">
              <span className="cafe-icon">🦌</span>
              <div className="cafe-text">
                <h1 className="cafe-title">NINDÓ</h1>
                <span className="cafe-subtitle">CAFÉ</span>
                <p className="cafe-tagline">EL QUE TE HACE VOLAR</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón hamburguesa */}
        <button
          className={`cafe-hamburger${menuAbierto ? " open" : ""}`}
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Overlay oscuro cuando el menú está abierto */}
        {menuAbierto && (
          <div
            className="cafe-menu-overlay"
            onClick={closeMenu}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.4)",
              zIndex: 1049
            }}
          />
        )}

        <nav className={`cafe-nav${menuAbierto ? " open" : ""}`} style={{zIndex: 1050}} onClick={closeMenu}>
          <ul onClick={e => e.stopPropagation()}>
            <li><Link href="/cafe" onClick={closeMenu}>Inicio</Link></li>
            <li><Link href="/cafeproductos" onClick={closeMenu}>Productos</Link></li>
            <li><Link href="/" onClick={closeMenu}>Panadería</Link></li>
            <li><LoginButton onClick={closeMenu}>Login</LoginButton></li>
            <li>
              <div className="cafe-nav-carrito" onClick={toggleCarrito}>
                🛒 Carrito ({productos.reduce((sum, p) => sum + p.cantidad, 0)})
              </div>
            </li>
          </ul>
        </nav>
      </header>
      {mostrarCarrito && <Carrito onClose={toggleCarrito} />}
    </>
  );
};

export default CafeHeader;
