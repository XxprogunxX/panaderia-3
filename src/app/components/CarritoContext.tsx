"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Producto = {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: number;
  categoria?: string;
  cantidad: number;
};

type CarritoContextType = {
  productos: Producto[];
  carrito: Producto[]; // Alias para compatibilidad
  agregarProducto: (producto: Producto) => void;
  agregarAlCarrito: (producto: Omit<Producto, 'cantidad'>, cantidad?: number) => void; // Ahora acepta cantidad
  eliminarProducto: (index: number) => void;
  eliminarDelCarrito: (nombre: string) => void; // Para compatibilidad
  vaciarCarrito: () => void;
  mostrarCarrito: boolean;
  toggleCarrito: () => void;
  total: number;
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return context;
};

export const CarritoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const data = localStorage.getItem("carrito");
    if (data) {
      try {
        setProductos(JSON.parse(data));
      } catch (error) {
        console.error("Error al parsear el carrito desde localStorage:", error);
        setProductos([]);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(productos));
  }, [productos]);

  const agregarProducto = (producto: Producto) => {
    setProductos((prev) => [...prev, producto]);
  };

  const agregarAlCarrito = (producto: Omit<Producto, 'cantidad'>, cantidad: number = 1) => {
    setProductos((prev) => {
      const existe = prev.find((p) => p.nombre === producto.nombre);
      if (existe) {
        // Si el producto ya está, incrementa su cantidad en la cantidad indicada
        return prev.map((p) =>
          p.nombre === producto.nombre ? { ...p, cantidad: p.cantidad + cantidad } : p
        );
      } else {
        // Si el producto no está, añádelo con la cantidad indicada
        return [...prev, { ...producto, cantidad }];
      }
    });
  };

  const eliminarProducto = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  const eliminarDelCarrito = (nombre: string) => {
    setProductos((prev) => {
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

  const vaciarCarrito = () => setProductos([]);

  const toggleCarrito = () => {
    setMostrarCarrito((prev) => !prev);
  };

  // Cálculo del total del carrito
  const total = productos.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <CarritoContext.Provider value={{
      productos,
      carrito: productos, // Alias para compatibilidad
      agregarProducto,
      agregarAlCarrito,
      eliminarProducto,
      eliminarDelCarrito,
      vaciarCarrito,
      mostrarCarrito,
      toggleCarrito,
      total
    }}>
      {children}
    </CarritoContext.Provider>
  );
}; 