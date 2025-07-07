"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Producto = {
  nombre: string;
  precio: number;
  cantidad: number;
};

type CarritoContextType = {
  productos: Producto[];
  agregarProducto: (producto: Producto) => void;
  eliminarProducto: (index: number) => void;
  vaciarCarrito: () => void;
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  return context;
};

export const CarritoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productos, setProductos] = useState<Producto[]>([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const data = localStorage.getItem("carrito");
    if (data) setProductos(JSON.parse(data));
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(productos));
  }, [productos]);

  const agregarProducto = (producto: Producto) => {
    setProductos((prev) => [...prev, producto]);
  };

  const eliminarProducto = (index: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== index));
  };

  const vaciarCarrito = () => setProductos([]);

  return (
    <CarritoContext.Provider value={{ productos, agregarProducto, eliminarProducto, vaciarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
}; 