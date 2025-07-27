"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Carrito from "./Carrito";
import { useCarrito } from "./CarritoContext";

const Header = () => {
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
      <header className="header">
        <div className="logo-link-header">
          <Image src="/images/logo.png" alt="Logo" width={60} height={60} className="logo-img" />
          <h1 className="logo">Panadería El Pan de Cada Día</h1>
        </div>
        {/* Botón hamburguesa solo visible en móvil y cuando el menú está cerrado */}
        {!menuAbierto && (
          <button
            className={`hamburger${menuAbierto ? " open" : ""}`}
            onClick={toggleMenu}
            aria-label="Abrir menú"
          >
            <span />
            <span />
            <span />
          </button>
        )}
        {/* Overlay oscuro cuando el menú está abierto */}
        {menuAbierto && (
          <div
            className="menu-overlay"
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
        <nav className={`nav${menuAbierto ? " open" : ""}`} style={{zIndex: 1050}} onClick={closeMenu}>
          <ul onClick={e => e.stopPropagation()}>
            <li><Link href="/" onClick={closeMenu}>Inicio</Link></li>
            <li><Link href="/productos" onClick={closeMenu}>Productos</Link></li>
            <li><Link href="/cafe" onClick={closeMenu}>Cafe</Link></li>
            <li><Link href="/nosotros" onClick={closeMenu}>Nosotros</Link></li>
            <li><Link href="/login" onClick={closeMenu}>Login</Link></li>
            <li>
              <div className="nav-carrito" onClick={toggleCarrito}>
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

export default Header; 