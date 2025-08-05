'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Estados de pago de Mercado Pago
enum EstadoPago {
  PENDIENTE = 'pending',
  APROBADO = 'approved',
  RECHAZADO = 'rejected',
  CANCELADO = 'cancelled',
  EN_PROCESO = 'in_process',
  AUTORIZADO = 'authorized',
  EN_MEDIACION = 'in_mediation',
  REEMBOLSADO = 'refunded',
  PAGADO = 'paid',
  COMPLETADO = 'completed'
}

interface Compra {
  id: string;
  fecha: string;
  total: number;
  productos: Array<{
    nombre: string;
    precio: number;
    cantidad: number;
  }>;
  estado: string;
  estadoPago?: EstadoPago;
  idPago?: string; // ID de Mercado Pago
  fechaPago?: string;
  direccionEntrega?: string;
  datosEnvio?: {
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    codigoPostal: string;
    ciudad: string;
    estado: string;
    instrucciones?: string;
  };
}

export default function HistorialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [comprasFiltradas, setComprasFiltradas] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [filtroFecha, setFiltroFecha] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
  const [ordenDescendente, setOrdenDescendente] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      cargarHistorial();
    }
  }, [user]);

  const cargarHistorial = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userDocRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const historialCompras = userData.historialCompras || [];
        
        // Actualizar estados de pago desde Mercado Pago
        const historialActualizado = await actualizarEstadosPago(historialCompras);
        setCompras(historialActualizado);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setError('Error al cargar el historial de compras');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar estados de pago desde Mercado Pago
  const actualizarEstadosPago = async (compras: Compra[]): Promise<Compra[]> => {
    const comprasActualizadas = await Promise.all(
      compras.map(async (compra) => {
        if (compra.idPago) {
          try {
            // Consultar estado de pago en Mercado Pago
            const respuesta = await fetch(`/api/mercadopago/payment/${compra.idPago}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (respuesta.ok) {
              const dataPago = await respuesta.json();
              return {
                ...compra,
                estadoPago: dataPago.status,
                fechaPago: dataPago.date_approved || compra.fechaPago
              };
            }
          } catch (error) {
            console.error(`Error al consultar pago ${compra.idPago}:`, error);
          }
        }
        return compra;
      })
    );

    return comprasActualizadas;
  };

  const handleVolver = () => {
    router.back();
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
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

  // Función para obtener información del estado de pago
  const obtenerInfoEstadoPago = (estadoPago?: EstadoPago) => {
    switch (estadoPago) {
      case EstadoPago.PENDIENTE:
        return { texto: 'Pendiente', clase: 'pendiente', color: '#fef3c7', textColor: '#92400e' };
      case EstadoPago.APROBADO:
        return { texto: 'Aprobado', clase: 'aprobado', color: '#dcfce7', textColor: '#166534' };
      case EstadoPago.RECHAZADO:
        return { texto: 'Rechazado', clase: 'rechazado', color: '#fee2e2', textColor: '#991b1b' };
      case EstadoPago.CANCELADO:
        return { texto: 'Cancelado', clase: 'cancelado', color: '#fee2e2', textColor: '#991b1b' };
      case EstadoPago.EN_PROCESO:
        return { texto: 'En Proceso', clase: 'en-proceso', color: '#dbeafe', textColor: '#1e40af' };
      case EstadoPago.AUTORIZADO:
        return { texto: 'Autorizado', clase: 'autorizado', color: '#dbeafe', textColor: '#1e40af' };
      case EstadoPago.EN_MEDIACION:
        return { texto: 'En Mediación', clase: 'en-mediacion', color: '#fef3c7', textColor: '#92400e' };
      case EstadoPago.REEMBOLSADO:
        return { texto: 'Reembolsado', clase: 'reembolsado', color: '#f3e8ff', textColor: '#7c3aed' };
      case EstadoPago.PAGADO:
        return { texto: 'Pagado', clase: 'pagado', color: '#dcfce7', textColor: '#166534' };
      case EstadoPago.COMPLETADO:
        return { texto: 'Completado', clase: 'completado', color: '#dcfce7', textColor: '#166534' };
      default:
        return { texto: 'Sin información', clase: 'sin-info', color: '#f3f4f6', textColor: '#6b7280' };
    }
  };

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let resultado = [...compras];

    // Filtro por fecha
    if (filtroFecha) {
      const fechaFiltro = new Date(filtroFecha);
      resultado = resultado.filter(compra => {
        const fechaCompra = new Date(compra.fecha);
        return fechaCompra.toDateString() === fechaFiltro.toDateString();
      });
    }

    // Filtro por estado
    if (filtroEstado) {
      resultado = resultado.filter(compra => {
        const infoEstado = obtenerInfoEstadoPago(compra.estadoPago);
        return infoEstado.texto.toLowerCase().includes(filtroEstado.toLowerCase()) ||
               compra.estado.toLowerCase().includes(filtroEstado.toLowerCase());
      });
    }

    // Búsqueda por productos
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(compra =>
        compra.productos.some(producto =>
          producto.nombre.toLowerCase().includes(busquedaLower)
        )
      );
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA: any, valorB: any;

      switch (ordenarPor) {
        case 'fecha':
          valorA = new Date(a.fecha);
          valorB = new Date(b.fecha);
          break;
        case 'total':
          valorA = a.total;
          valorB = b.total;
          break;
        case 'estado':
          valorA = a.estado;
          valorB = b.estado;
          break;
        default:
          valorA = new Date(a.fecha);
          valorB = new Date(b.fecha);
      }

      if (ordenDescendente) {
        return valorB > valorA ? 1 : -1;
      } else {
        return valorA > valorB ? 1 : -1;
      }
    });

    setComprasFiltradas(resultado);
  };

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    aplicarFiltros();
  }, [compras, filtroFecha, filtroEstado, busqueda, ordenarPor, ordenDescendente]);

  // Función para exportar datos
  const exportarDatos = () => {
    const datosParaExportar = comprasFiltradas.map(compra => {
      const infoEstado = obtenerInfoEstadoPago(compra.estadoPago);
      return {
        'ID Compra': compra.id.slice(-8),
        'Fecha': formatearFecha(compra.fecha),
        'Total': formatearPrecio(compra.total),
        'Estado': compra.estado,
        'Estado de Pago': infoEstado.texto,
        'ID Pago MP': compra.idPago || 'N/A',
        'Fecha Pago': compra.fechaPago ? formatearFecha(compra.fechaPago) : 'N/A',
        'Productos': compra.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', '),
        'Dirección': compra.direccionEntrega || 'No especificada'
      };
    });

    // Crear CSV
    const headers = Object.keys(datosParaExportar[0]);
    const csvContent = [
      headers.join(','),
      ...datosParaExportar.map(row => 
        headers.map(header => `"${(row as any)[header]}"`).join(',')
      )
    ].join('\n');

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_compras_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroFecha('');
    setFiltroEstado('');
    setBusqueda('');
    setOrdenarPor('fecha');
    setOrdenDescendente(true);
  };

  if (loading) {
    return (
      <div className="historial-page">
        <div className="historial-page-header">
          <button 
            onClick={handleVolver}
            className="btn-volver"
            aria-label="Volver"
          >
            ← Volver
          </button>
          <h1>Mi Historial de Compras</h1>
        </div>
        <div className="loading-historial">
          <p>Cargando historial de compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-page">
      <div className="historial-page-header">
        <button 
          onClick={handleVolver}
          className="btn-volver"
          aria-label="Volver"
        >
          ← Volver
        </button>
        <h1>Mi Historial de Compras</h1>
      </div>

      <div className="historial-page-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {compras.length === 0 ? (
          <div className="sin-compras">
            <div className="sin-compras-icon">📋</div>
            <h3>Aún no tienes compras</h3>
            <p>Cuando realices tu primera compra, aparecerá aquí tu historial completo.</p>
            <button 
              onClick={() => router.push('/productos')}
              className="btn-explorar-productos"
            >
              Explorar Productos
            </button>
          </div>
        ) : (
          <>
            {/* Sección de filtros */}
            <div className="filtros-historial">
              <div className="filtros-header">
                <h3>Filtros y Búsqueda</h3>
                <div className="filtros-acciones">
                  <button 
                    onClick={exportarDatos}
                    className="btn-exportar"
                    disabled={comprasFiltradas.length === 0}
                  >
                    📊 Exportar CSV
                  </button>
                  <button 
                    onClick={limpiarFiltros}
                    className="btn-limpiar-filtros"
                  >
                    🗑️ Limpiar Filtros
                  </button>
                </div>
              </div>

              <div className="filtros-grid">
                <div className="filtro-grupo">
                  <label htmlFor="busqueda">Buscar productos:</label>
                  <input
                    type="text"
                    id="busqueda"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Ej: pan, café, galletas..."
                    className="filtro-input"
                  />
                </div>

                <div className="filtro-grupo">
                  <label htmlFor="filtroFecha">Filtrar por fecha:</label>
                  <input
                    type="date"
                    id="filtroFecha"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="filtro-input"
                  />
                </div>

                <div className="filtro-grupo">
                  <label htmlFor="filtroEstado">Filtrar por estado:</label>
                  <select
                    id="filtroEstado"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="filtro-input"
                  >
                    <option value="">Todos los estados</option>
                    <option value="completada">Completada</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en-proceso">En Proceso</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="aprobado">Pago Aprobado</option>
                    <option value="rechazado">Pago Rechazado</option>
                    <option value="autorizado">Pago Autorizado</option>
                    <option value="en-mediacion">En Mediación</option>
                    <option value="reembolsado">Reembolsado</option>
                    <option value="pagado">Pagado</option>
                  </select>
                </div>

                <div className="filtro-grupo">
                  <label htmlFor="ordenarPor">Ordenar por:</label>
                  <select
                    id="ordenarPor"
                    value={ordenarPor}
                    onChange={(e) => setOrdenarPor(e.target.value)}
                    className="filtro-input"
                  >
                    <option value="fecha">Fecha</option>
                    <option value="total">Total</option>
                    <option value="estado">Estado</option>
                  </select>
                </div>

                <div className="filtro-grupo">
                  <label htmlFor="orden">Orden:</label>
                  <select
                    id="orden"
                    value={ordenDescendente ? 'desc' : 'asc'}
                    onChange={(e) => setOrdenDescendente(e.target.value === 'desc')}
                    className="filtro-input"
                  >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                  </select>
                </div>
              </div>

              <div className="filtros-info">
                <p>
                  Mostrando {comprasFiltradas.length} de {compras.length} compras
                  {busqueda && ` que contienen "${busqueda}"`}
                  {filtroFecha && ` del ${new Date(filtroFecha).toLocaleDateString('es-ES')}`}
                  {filtroEstado && ` con estado "${filtroEstado}"`}
                </p>
              </div>
            </div>

            {/* Lista de compras filtradas */}
            <div className="lista-compras">
              {comprasFiltradas.length === 0 ? (
                <div className="sin-resultados">
                  <div className="sin-resultados-icon">🔍</div>
                  <h3>No se encontraron compras</h3>
                  <p>Intenta ajustar los filtros de búsqueda.</p>
                  <button 
                    onClick={limpiarFiltros}
                    className="btn-limpiar-filtros"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                comprasFiltradas.map((compra) => {
                  const infoEstadoPago = obtenerInfoEstadoPago(compra.estadoPago);
                  return (
                    <div key={compra.id} className="compra-item">
                      <div className="compra-header">
                        <div className="compra-info">
                          <h3>Compra #{compra.id.slice(-8)}</h3>
                          <p className="compra-fecha">{formatearFecha(compra.fecha)}</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className={`estado-compra ${compra.estado.toLowerCase()}`}>
                              {compra.estado}
                            </span>
                            {compra.estadoPago && (
                              <span 
                                className="estado-pago"
                                style={{
                                  backgroundColor: infoEstadoPago.color,
                                  color: infoEstadoPago.textColor,
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  textTransform: 'uppercase'
                                }}
                              >
                                💳 {infoEstadoPago.texto}
                              </span>
                            )}
                          </div>
                          {compra.idPago && (
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                              ID Pago: {compra.idPago}
                            </p>
                          )}
                          {compra.fechaPago && (
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                              Pagado: {formatearFecha(compra.fechaPago)}
                            </p>
                          )}
                        </div>
                        <div className="compra-total">
                          <strong>{formatearPrecio(compra.total)}</strong>
                        </div>
                      </div>

                    <div className="compra-productos">
                      <h4>Productos:</h4>
                      <ul>
                        {compra.productos.map((producto, index) => (
                          <li key={index} className="producto-item">
                            <span className="producto-nombre">{producto.nombre}</span>
                            <span className="producto-cantidad">x{producto.cantidad}</span>
                            <span className="producto-precio">
                              {formatearPrecio(producto.precio * producto.cantidad)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {compra.direccionEntrega && (
                      <div className="compra-direccion">
                        <h4>Dirección de entrega:</h4>
                        <p>{compra.direccionEntrega}</p>
                      </div>
                    )}
                  </div>
                );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 