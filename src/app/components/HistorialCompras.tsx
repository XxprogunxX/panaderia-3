import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface ProductoPedido {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Pedido {
  id: string;
  productos: ProductoPedido[];
  total: number;
  estado: string;
  fechaCreacion: string;
  datosEnvio: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    codigoPostal: string;
    ciudad: string;
    estado: string;
    instrucciones?: string;
  };
  guiaEnvio?: string;
}

interface HistorialComprasProps {
  onClose: () => void;
}

const HistorialCompras: React.FC<HistorialComprasProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      cargarHistorial();
    }
  }, [user]);

  const cargarHistorial = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar pedidos del usuario por email
      const pedidosRef = collection(db, "pedidos");
      const q = query(
        pedidosRef,
        where("datosEnvio.email", "==", user.email),
        orderBy("fechaCreacion", "desc")
      );

      const querySnapshot = await getDocs(q);
      const pedidosData: Pedido[] = [];

      querySnapshot.forEach((doc) => {
        pedidosData.push({
          id: doc.id,
          ...doc.data()
        } as Pedido);
      });

      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setError('Error al cargar el historial de compras');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  };

  const obtenerEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return '#FFA500';
      case 'procesando':
        return '#87CEEB';
      case 'enviado':
        return '#32CD32';
      case 'entregado':
        return '#228B22';
      case 'cancelado':
        return '#DC143C';
      default:
        return '#6B5B47';
    }
  };

  if (loading) {
    return (
      <div className="modal-historial">
        <div className="modal-content-historial">
          <div className="loading-historial">
            <div className="spinner"></div>
            <p>Cargando historial de compras...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-historial">
      <div className="modal-content-historial">
        <div className="historial-header">
          <h3>Historial de Compras</h3>
          <button 
            type="button"
            className="btn-cerrar-historial"
            onClick={onClose}
            aria-label="Cerrar historial"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="error-historial">
            <p>{error}</p>
            <button 
              type="button"
              className="btn-reintentar"
              onClick={cargarHistorial}
            >
              Reintentar
            </button>
          </div>
        )}

        {pedidos.length === 0 ? (
          <div className="sin-pedidos">
            <div className="icono-sin-pedidos">🛒</div>
            <h4>No tienes compras aún</h4>
            <p>Cuando realices tu primera compra, aparecerá aquí tu historial.</p>
          </div>
        ) : (
          <div className="lista-pedidos">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="pedido-item">
                <div className="pedido-header">
                  <div className="pedido-info-principal">
                    <h4>Pedido #{pedido.id.slice(-8)}</h4>
                    <span className="pedido-fecha">
                      {formatearFecha(pedido.fechaCreacion)}
                    </span>
                  </div>
                  <div className="pedido-estado">
                    <span 
                      className="badge-estado"
                      style={{ backgroundColor: obtenerEstadoColor(pedido.estado) }}
                    >
                      {pedido.estado}
                    </span>
                  </div>
                </div>

                <div className="pedido-productos">
                  {pedido.productos.map((producto, index) => (
                    <div key={index} className="producto-pedido">
                      <span className="producto-nombre">
                        {producto.nombre} x{producto.cantidad}
                      </span>
                      <span className="producto-precio">
                        {formatearPrecio(producto.precio * producto.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pedido-footer">
                  <div className="pedido-total">
                    <strong>Total: {formatearPrecio(pedido.total)}</strong>
                  </div>
                  
                  {pedido.guiaEnvio && (
                    <div className="pedido-guia">
                      <span className="guia-label">Guía de envío:</span>
                      <span className="guia-valor">{pedido.guiaEnvio}</span>
                    </div>
                  )}
                </div>

                <div className="pedido-direccion">
                  <h5>Dirección de entrega:</h5>
                  <p>{pedido.datosEnvio.nombre}</p>
                  <p>{pedido.datosEnvio.direccion}</p>
                  <p>{pedido.datosEnvio.ciudad}, {pedido.datosEnvio.estado} {pedido.datosEnvio.codigoPostal}</p>
                  <p>Tel: {pedido.datosEnvio.telefono}</p>
                  {pedido.datosEnvio.instrucciones && (
                    <p className="instrucciones-entrega">
                      <em>Instrucciones: {pedido.datosEnvio.instrucciones}</em>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialCompras; 