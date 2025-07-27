"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCarrito } from './CarritoContext';
import styles from './CarritoFlotante.module.css';

const CarritoFlotante = () => {
  const router = useRouter();
  const { carrito, eliminarProducto, total } = useCarrito();
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  function eliminarDelCarrito(nombre: string) {
    // Encontrar el índice del producto y eliminarlo
    const indice = carrito.findIndex(item => item.nombre === nombre);
    if (indice !== -1) {
      eliminarProducto(indice);
    }
  }

  function toggleCarrito() {
    setMostrarCarrito(!mostrarCarrito);
  }

  function modificarCantidad(nombre: string, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(nombre);
      return;
    }
    
    // Encontrar el producto actual
    const productoActual = carrito.find(item => item.nombre === nombre);
    if (!productoActual) return;
    
    const diferenciaCantidar = nuevaCantidad - productoActual.cantidad;
    
    if (diferenciaCantidar > 0) {
      // Agregar más productos
      for (let i = 0; i < diferenciaCantidar; i++) {
        // Nota: Necesitarás agregar agregarProducto al contexto si no está disponible
        // agregarProducto({
        //   nombre: productoActual.nombre,
        //   precio: productoActual.precio,
        //   cantidad: 1
        // });
      }
    } else if (diferenciaCantidar < 0) {
      // Eliminar productos
      for (let i = 0; i < Math.abs(diferenciaCantidar); i++) {
        const indice = carrito.findIndex(item => item.nombre === nombre);
        if (indice !== -1) {
          eliminarProducto(indice);
        }
      }
    }
  }

  function procederAlCheckout() {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega algunos productos antes de proceder al pago.');
      return;
    }
    
    setMostrarCarrito(false);
    router.push('/checkout');
  }

  return (
    <>
      {/* Botón del carrito flotante - Solo en móvil */}
      <button 
        className={styles.carritoFlotante}
        onClick={toggleCarrito}
      >
        🛒 {carrito.length > 0 && (
          <span className={styles.badge}>
            {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
          </span>
        )}
      </button>

      {/* Carrito overlay */}
      {mostrarCarrito && (
        <div 
          className={styles.carritoOverlay}
          onClick={toggleCarrito}
        >
          <div 
            className={styles.carrito}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.carritoHeader}>
              <h2>Tu Carrito</h2>
              <button
                onClick={toggleCarrito}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            {carrito.length === 0 ? (
              <div className={styles.carritoVacio}>
                <p>Tu carrito está vacío</p>
                <button
                  onClick={toggleCarrito}
                  className={styles.continuarButton}
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <>
                <ul className={styles.carritoItems}>
                  {carrito.map(({ nombre, precio, cantidad }, index) => (
                    <li key={`${nombre}-${index}`} className={styles.carritoItem}>
                      <div className={styles.itemInfo}>
                        <strong>{nombre}</strong>
                        <div className={styles.itemPrecio}>
                          ${precio} MXN c/u
                        </div>
                      </div>
                      <div className={styles.itemControls}>
                        <button
                          onClick={() => modificarCantidad(nombre, cantidad - 1)}
                          className={styles.controlButton}
                        >
                          −
                        </button>
                        <span className={styles.cantidad}>{cantidad}</span>
                        <button
                          onClick={() => modificarCantidad(nombre, cantidad + 1)}
                          className={styles.controlButton}
                        >
                          +
                        </button>
                        <button
                          onClick={() => eliminarDelCarrito(nombre)}
                          className={styles.deleteButton}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className={styles.carritoTotal}>
                  <span>
                    {carrito.reduce((acc, item) => acc + item.cantidad, 0)} producto(s)
                  </span>
                  <span className={styles.totalAmount}>
                    ${total} MXN
                  </span>
                </div>
                
                <div className={styles.carritoActions}>
                  <button
                    onClick={toggleCarrito}
                    className={styles.seguirButton}
                  >
                    Seguir Comprando
                  </button>
                  <Link href="/checkout" className={styles.checkoutLink}>
                    <button
                      onClick={procederAlCheckout}
                      className={styles.checkoutButton}
                    >
                      Proceder al Pago
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CarritoFlotante; 