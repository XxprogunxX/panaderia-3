// components/Carrito.tsx
import { FC } from "react";
import { useCarrito } from "./CarritoContext";

interface CarritoProps {
  onClose: () => void;
}

const Carrito: FC<CarritoProps> = ({ onClose }) => {
  const { productos, eliminarProducto, vaciarCarrito } = useCarrito();
  // Calcular el total
  const total = productos.reduce((sum, producto) => sum + producto.precio * producto.cantidad, 0);

  return (
    <div className="carrito-overlay" onClick={onClose}>
      <div className="carrito" onClick={e => e.stopPropagation()}>
        <h2>Tu Carrito</h2>
        {productos.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <>
            <ul>
              {productos.map((producto, index) => (
                <li key={producto.nombre} className="carrito-item">
                  <span>{producto.nombre} x {producto.cantidad}</span>
                  <span>${(producto.precio * producto.cantidad).toFixed(2)} MXN</span>
                  <button className="btn-eliminar" onClick={() => eliminarProducto(index)}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <div className="carrito-total">
              <strong>Total: </strong>${total.toFixed(2)} MXN
            </div>
            <button className="btn-pagar" disabled={productos.length === 0}>
              Proceder al pago
            </button>
          </>
        )}
        <button className="btn-cerrar" onClick={onClose}>
          Cerrar
        </button>
        <button className="btn-eliminar" style={{width: '100%', marginTop: 8}} onClick={vaciarCarrito}>
          Vaciar Carrito
        </button>
      </div>
    </div>
  );
};

export default Carrito;