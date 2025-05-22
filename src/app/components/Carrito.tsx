// components/Carrito.tsx
import { FC } from "react";
import { Button } from "./iu/button";

interface CarritoProps {
  productos: Array<{
    nombre: string;
    precio: number;
    cantidad: number;
  }>;
  eliminarProducto: (index: number) => void;
  vaciarCarrito: () => void;
}

const Carrito: FC<CarritoProps> = ({ productos, eliminarProducto, vaciarCarrito }) => {
  // Calcular el total
  const total = productos.reduce((sum, producto) => sum + producto.precio * producto.cantidad, 0);

  return (
    <div className="p-4 bg-white shadow-lg rounded-md">
      <h3 className="text-xl font-semibold mb-4">Carrito de Compras</h3>

      {productos.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <div>
          <ul>
            {productos.map((producto, index) => (
              <li key={index} className="flex justify-between items-center mb-2">
                <span>{producto.nombre} x{producto.cantidad}</span>
                <Button
                  className="bg-red-500 text-white"
                  onClick={() => eliminarProducto(index)}
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between items-center">
            <span>Total: ${total.toFixed(2)}</span>
            <Button className="bg-blue-500 text-white">Comprar</Button>
          </div>
          <Button
            className="mt-4 w-full bg-gray-500 text-white"
            onClick={vaciarCarrito}
          >
            Vaciar Carrito
          </Button>
        </div>
      )}
    </div>
  );
};

export default Carrito;