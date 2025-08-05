import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { updateProfile } from 'firebase/auth';

interface UsuarioData {
  displayName?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
}

interface EditarPerfilProps {
  onClose: () => void;
  onSave?: () => void;
}

const EditarPerfil: React.FC<EditarPerfilProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [datos, setDatos] = useState<UsuarioData>({
    displayName: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: ''
  });

  useEffect(() => {
    if (user) {
      cargarDatosUsuario();
    }
  }, [user]);

  const cargarDatosUsuario = async () => {
    if (!user) return;

    try {
      // Cargar datos de Firebase Auth
      setDatos(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || ''
      }));

      // Cargar datos adicionales de Firestore
      const userDocRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDatos(prev => ({
          ...prev,
          telefono: userData.telefono || '',
          direccion: userData.direccion || '',
          ciudad: userData.ciudad || '',
          estado: userData.estado || '',
          codigoPostal: userData.codigoPostal || ''
        }));
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      setError('Error al cargar los datos del usuario');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Actualizar displayName en Firebase Auth
      if (datos.displayName && datos.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: datos.displayName
        });
      }

      // Actualizar datos adicionales en Firestore
      const userDocRef = doc(db, "usuarios", user.uid);
      const datosActualizar: Partial<UsuarioData> = {};

      if (datos.telefono) datosActualizar.telefono = datos.telefono;
      if (datos.direccion) datosActualizar.direccion = datos.direccion;
      if (datos.ciudad) datosActualizar.ciudad = datos.ciudad;
      if (datos.estado) datosActualizar.estado = datos.estado;
      if (datos.codigoPostal) datosActualizar.codigoPostal = datos.codigoPostal;

      if (Object.keys(datosActualizar).length > 0) {
        await updateDoc(userDocRef, {
          ...datosActualizar,
          updatedAt: new Date().toISOString()
        });
      }

      setSuccess(true);
      if (onSave) onSave();
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Error al actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-perfil">
      <div className="modal-content-perfil">
        <div className="perfil-header">
          <h3>Editar Perfil</h3>
          <button 
            type="button"
            className="btn-cerrar-perfil"
            onClick={onClose}
            aria-label="Cerrar edición de perfil"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="error-perfil">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="success-perfil">
            <p>✅ Perfil actualizado correctamente</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-perfil">
          <div className="form-group">
            <label htmlFor="displayName">Nombre completo</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={datos.displayName}
              onChange={handleChange}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={datos.email}
              disabled
              className="input-disabled"
              placeholder="Tu correo electrónico"
            />
            <small>El correo electrónico no se puede cambiar</small>
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={datos.telefono}
              onChange={handleChange}
              placeholder="Tu número de teléfono"
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={datos.direccion}
              onChange={handleChange}
              placeholder="Tu dirección"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ciudad">Ciudad</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={datos.ciudad}
                onChange={handleChange}
                placeholder="Tu ciudad"
              />
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <input
                type="text"
                id="estado"
                name="estado"
                value={datos.estado}
                onChange={handleChange}
                placeholder="Tu estado"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="codigoPostal">Código Postal</label>
            <input
              type="text"
              id="codigoPostal"
              name="codigoPostal"
              value={datos.codigoPostal}
              onChange={handleChange}
              placeholder="Tu código postal"
            />
          </div>

          <div className="perfil-acciones">
            <button
              type="button"
              className="btn-cancelar-perfil"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar-perfil"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil; 