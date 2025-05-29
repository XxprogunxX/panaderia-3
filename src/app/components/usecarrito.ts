// src/hooks/useCarrito.ts
import { useState, useEffect } from "react";

// --- Interfaces ---
// Es buena práctica tener tus interfaces en un archivo separado
// (por ejemplo, src/types/index.ts) y luego importarlas.
// Por ahora, las incluimos aquí para que el archivo sea autocontenido.

interface Producto {
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  categoria: string;
}

interface ProductoConCantidad extends Producto {
  cantidad: number;
}

// --- Hook useCarrito ---
export function useCarrito() {
  // 1. Inicialización del estado del carrito
  // Intentamos cargar el carrito desde localStorage UNA SOLA VEZ al inicio.
  // Usamos una función para `useState` para asegurar que esto solo se ejecute en el render inicial.
  const [carrito, setCarrito] = useState<ProductoConCantidad[]>(() => {
    // Verificamos si estamos en el entorno del navegador (donde `window` existe)
    if (typeof window !== "undefined") {
      try {
        const savedCarrito = localStorage.getItem("carrito");
        // Si hay datos guardados, los parseamos. Si no, devolvemos un array vacío.
        return savedCarrito ? JSON.parse(savedCarrito) : [];
      } catch (error) {
        // En caso de que localStorage tenga datos corruptos o no válidos
        console.error("Error al parsear el carrito desde localStorage:", error);
        return [];
      }
    }
    // Si no estamos en el navegador (ej. renderizado en el servidor), devolvemos un array vacío.
    return [];
  });

  // Estado para controlar la visibilidad del overlay del carrito
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // 2. Persistencia del carrito en localStorage
  // Este useEffect se ejecuta cada vez que el estado `carrito` cambia.
  // Esto asegura que cualquier adición o eliminación se guarde.
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("carrito", JSON.stringify(carrito));
      } catch (error) {
        console.error("Error al guardar el carrito en localStorage:", error);
      }
    }
  }, [carrito]); // La dependencia `carrito` hace que se ejecute cuando el carrito cambia.

  // --- Funciones del Carrito ---

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.nombre === producto.nombre);
      if (existe) {
        // Si el producto ya está, incrementa su cantidad
        return prev.map((p) =>
          p.nombre === producto.nombre ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      } else {
        // Si el producto no está, añádelo con cantidad 1
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  };

  const eliminarDelCarrito = (nombre: string) => {
    setCarrito((prev) => {
      const productoExistente = prev.find((p) => p.nombre === nombre);
      if (productoExistente && productoExistente.cantidad > 1) {
        // Si hay más de una cantidad, decrementa
        return prev.map((p) =>
          p.nombre === nombre ? { ...p, cantidad: p.cantidad - 1 } : p
        );
      } else {
        // Si es la última cantidad o no existe, elimínalo completamente
        return prev.filter((p) => p.nombre !== nombre);
      }
    });
  };

  const toggleCarrito = () => {
    setMostrarCarrito((prev) => !prev);
  };

  // Cálculo del total del carrito
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // --- Retorno del Hook ---
  // El hook devuelve el estado y las funciones que los componentes necesitarán.
  return {
    carrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    mostrarCarrito,
    toggleCarrito,
    total,
    // Opcional: `setCarrito` directo si necesitas un control más fino en algún componente
    // setCarrito,
  };
}