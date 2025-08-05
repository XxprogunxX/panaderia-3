import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface DireccionGuardada {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  instrucciones?: string;
  esPredeterminada: boolean;
}

interface DireccionesGuardadasProps {
  onSeleccionarDireccion: (direccion: DireccionGuardada) => void;
  direccionSeleccionada?: DireccionGuardada | null;
}

const DireccionesGuardadas: React.FC<DireccionesGuardadasProps> = ({ 
  onSeleccionarDireccion, 
  direccionSeleccionada 
}) => {
  const { user } = useAuth();
  const [direcciones, setDirecciones] = useState<DireccionGuardada[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaDireccion, setNuevaDireccion] = useState<Omit<DireccionGuardada, 'id' | 'esPredeterminada'>>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    estado: '',
    instrucciones: ''
  });

  // Cargar direcciones guardadas
  useEffect(() => {
    if (user) {
      cargarDirecciones();
    }
  }, [user]);

  const cargarDirecciones = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const direccionesGuardadas: DireccionGuardada[] = userData.direcciones || [];
        setDirecciones(direccionesGuardadas);
        
        // Si no hay dirección seleccionada y hay direcciones guardadas, seleccionar la predeterminada
        if (!direccionSeleccionada && direccionesGuardadas.length > 0) {
          const predeterminada = direccionesGuardadas.find((d: DireccionGuardada) => d.esPredeterminada);
          if (predeterminada) {
            onSeleccionarDireccion(predeterminada);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar direcciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarDireccion = async () => {
    if (!user) return;

    try {
      const nuevaDireccionCompleta: DireccionGuardada = {
        ...nuevaDireccion,
        id: Date.now().toString(),
        esPredeterminada: direcciones.length === 0 // La primera dirección será predeterminada
      };

      const userDocRef = doc(db, "usuarios", user.uid);
      await updateDoc(userDocRef, {
        direcciones: arrayUnion(nuevaDireccionCompleta)
      });

      setDirecciones(prev => [...prev, nuevaDireccionCompleta]);
      setNuevaDireccion({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        codigoPostal: '',
        ciudad: '',
        estado: '',
        instrucciones: ''
      });
      setMostrarFormulario(false);
      
      // Si es la primera dirección, seleccionarla automáticamente
      if (direcciones.length === 0) {
        onSeleccionarDireccion(nuevaDireccionCompleta);
      }
    } catch (error) {
      console.error('Error al guardar dirección:', error);
      alert('Error al guardar la dirección. Inténtalo de nuevo.');
    }
  };

  const eliminarDireccion = async (id: string) => {
    if (!user) return;

    try {
      const direccionAEliminar = direcciones.find(d => d.id === id);
      if (!direccionAEliminar) return;

      const userDocRef = doc(db, "usuarios", user.uid);
      await updateDoc(userDocRef, {
        direcciones: arrayRemove(direccionAEliminar)
      });

      setDirecciones(prev => prev.filter(d => d.id !== id));
      
      // Si se eliminó la dirección seleccionada, limpiar selección
      if (direccionSeleccionada?.id === id) {
        onSeleccionarDireccion(null as any);
      }
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      alert('Error al eliminar la dirección. Inténtalo de nuevo.');
    }
  };

  const establecerPredeterminada = async (id: string) => {
    if (!user) return;

    try {
      const direccionesActualizadas = direcciones.map(d => ({
        ...d,
        esPredeterminada: d.id === id
      }));

      const userDocRef = doc(db, "usuarios", user.uid);
      await updateDoc(userDocRef, {
        direcciones: direccionesActualizadas
      });

      setDirecciones(direccionesActualizadas);
    } catch (error) {
      console.error('Error al establecer dirección predeterminada:', error);
      alert('Error al establecer la dirección predeterminada. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return <div className="loading-direcciones">Cargando direcciones...</div>;
  }

  return (
    <div className="direcciones-guardadas">
      <div className="direcciones-header">
        <h3>Direcciones Guardadas</h3>
        <button 
          type="button"
          className="btn-agregar-direccion"
          onClick={() => setMostrarFormulario(true)}
        >
          + Agregar Nueva Dirección
        </button>
      </div>

      {direcciones.length === 0 ? (
        <div className="sin-direcciones">
          <p>No tienes direcciones guardadas. Agrega una para facilitar tus compras.</p>
        </div>
      ) : (
        <div className="lista-direcciones">
          {direcciones.map((direccion) => (
            <div 
              key={direccion.id} 
              className={`direccion-item ${direccionSeleccionada?.id === direccion.id ? 'seleccionada' : ''}`}
            >
              <div className="direccion-info">
                <div className="direccion-header">
                  <strong>{direccion.nombre}</strong>
                  {direccion.esPredeterminada && (
                    <span className="badge-predeterminada">Predeterminada</span>
                  )}
                </div>
                <p>{direccion.direccion}</p>
                <p>{direccion.ciudad}, {direccion.estado} {direccion.codigoPostal}</p>
                <p>Tel: {direccion.telefono}</p>
                {direccion.instrucciones && (
                  <p className="instrucciones">Instrucciones: {direccion.instrucciones}</p>
                )}
              </div>
              
              <div className="direccion-acciones">
                <button
                  type="button"
                  className="btn-seleccionar"
                  onClick={() => onSeleccionarDireccion(direccion)}
                >
                  {direccionSeleccionada?.id === direccion.id ? 'Seleccionada' : 'Seleccionar'}
                </button>
                
                {!direccion.esPredeterminada && (
                  <button
                    type="button"
                    className="btn-predeterminada"
                    onClick={() => establecerPredeterminada(direccion.id)}
                  >
                    Hacer Predeterminada
                  </button>
                )}
                
                <button
                  type="button"
                  className="btn-eliminar"
                  onClick={() => eliminarDireccion(direccion.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarFormulario && (
        <div className="modal-direccion">
          <div className="modal-content">
            <h4>Agregar Nueva Dirección</h4>
            
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo *</label>
              <input
                type="text"
                id="nombre"
                value={nuevaDireccion.nombre}
                onChange={(e) => setNuevaDireccion(prev => ({ ...prev, nombre: e.target.value }))}
                required
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico *</label>
              <input
                type="email"
                id="email"
                value={nuevaDireccion.email}
                onChange={(e) => setNuevaDireccion(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="Ej: juan@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                value={nuevaDireccion.telefono}
                onChange={(e) => setNuevaDireccion(prev => ({ ...prev, telefono: e.target.value }))}
                required
                placeholder="Ej: 555-123-4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección de entrega *</label>
              <input
                type="text"
                id="direccion"
                value={nuevaDireccion.direccion}
                onChange={(e) => setNuevaDireccion(prev => ({ ...prev, direccion: e.target.value }))}
                required
                placeholder="Ej: Calle Principal #123"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="codigoPostal">Código Postal *</label>
                <input
                  type="text"
                  id="codigoPostal"
                  value={nuevaDireccion.codigoPostal}
                  onChange={(e) => setNuevaDireccion(prev => ({ ...prev, codigoPostal: e.target.value }))}
                  required
                  placeholder="Ej: 12345"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">Ciudad *</label>
                <input
                  type="text"
                  id="ciudad"
                  value={nuevaDireccion.ciudad}
                  onChange={(e) => setNuevaDireccion(prev => ({ ...prev, ciudad: e.target.value }))}
                  required
                  placeholder="Ej: Ciudad de México"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado *</label>
              <input
                type="text"
                id="estado"
                value={nuevaDireccion.estado}
                onChange={(e) => setNuevaDireccion(prev => ({ ...prev, estado: e.target.value }))}
                required
                placeholder="Ej: CDMX"
              />
            </div>

            <div className="form-group">
              <label htmlFor="instrucciones">Instrucciones de entrega (opcional)</label>
              <textarea
                id="instrucciones"
                value={nuevaDireccion.instrucciones}
                onChange={(e) => setNuevaDireccion(prev => ({ ...prev, instrucciones: e.target.value }))}
                placeholder="Ej: Tocar el timbre, dejar con el portero, etc."
                rows={3}
              />
            </div>

            <div className="modal-acciones">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-guardar"
                onClick={guardarDireccion}
                disabled={!nuevaDireccion.nombre || !nuevaDireccion.email || !nuevaDireccion.telefono || !nuevaDireccion.direccion || !nuevaDireccion.codigoPostal || !nuevaDireccion.ciudad || !nuevaDireccion.estado}
              >
                Guardar Dirección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DireccionesGuardadas; 