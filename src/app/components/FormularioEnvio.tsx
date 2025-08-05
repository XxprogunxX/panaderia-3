import React from 'react';
import { useAuth } from './AuthContext';
import DireccionesGuardadas from './DireccionesGuardadas';

interface DatosEnvio {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  instrucciones?: string;
}

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

interface FormularioEnvioProps {
  onSubmit: (datos: DatosEnvio) => void;
  isLoading: boolean;
}

const FormularioEnvio: React.FC<FormularioEnvioProps> = ({ onSubmit, isLoading }) => {
  const { user } = useAuth();
  const [datos, setDatos] = React.useState<DatosEnvio>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    estado: '',
    instrucciones: ''
  });
  const [direccionSeleccionada, setDireccionSeleccionada] = React.useState<DireccionGuardada | null>(null);
  const [usarDireccionGuardada, setUsarDireccionGuardada] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si se está usando una dirección guardada, usar esos datos
    if (usarDireccionGuardada && direccionSeleccionada) {
      const datosDireccionGuardada: DatosEnvio = {
        nombre: direccionSeleccionada.nombre,
        email: direccionSeleccionada.email,
        telefono: direccionSeleccionada.telefono,
        direccion: direccionSeleccionada.direccion,
        codigoPostal: direccionSeleccionada.codigoPostal,
        ciudad: direccionSeleccionada.ciudad,
        estado: direccionSeleccionada.estado,
        instrucciones: direccionSeleccionada.instrucciones
      };
      onSubmit(datosDireccionGuardada);
    } else if (!usarDireccionGuardada) {
      // Validar que todos los campos requeridos estén llenos
      const camposRequeridos = ['nombre', 'email', 'telefono', 'direccion', 'codigoPostal', 'ciudad', 'estado'];
      const camposVacios = camposRequeridos.filter(campo => !datos[campo as keyof DatosEnvio]);
      
      if (camposVacios.length > 0) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
      }
      
      onSubmit(datos);
    } else {
      alert('Por favor, selecciona una dirección guardada o completa el formulario.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeleccionarDireccion = (direccion: DireccionGuardada) => {
    setDireccionSeleccionada(direccion);
    setUsarDireccionGuardada(true);
  };

  const handleUsarNuevaDireccion = () => {
    setUsarDireccionGuardada(false);
    setDireccionSeleccionada(null);
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-envio">
      <h3>Datos de Envío</h3>
      
      {/* Sección de direcciones guardadas para usuarios autenticados */}
      {user && (
        <div className="seccion-direcciones-guardadas">
          <div className="opciones-direccion">
            <label className="opcion-direccion">
              <input
                type="radio"
                name="tipoDireccion"
                checked={usarDireccionGuardada}
                onChange={() => setUsarDireccionGuardada(true)}
              />
              <span>Usar dirección guardada</span>
            </label>
            <label className="opcion-direccion">
              <input
                type="radio"
                name="tipoDireccion"
                checked={!usarDireccionGuardada}
                onChange={handleUsarNuevaDireccion}
              />
              <span>Usar nueva dirección</span>
            </label>
          </div>

          {usarDireccionGuardada && (
            <DireccionesGuardadas
              onSeleccionarDireccion={handleSeleccionarDireccion}
              direccionSeleccionada={direccionSeleccionada}
            />
          )}
        </div>
      )}

      {/* Formulario de nueva dirección - solo mostrar si no se usa dirección guardada o si no hay usuario */}
      {(!usarDireccionGuardada || !user) && (
        <>
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={datos.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={datos.email}
              onChange={handleChange}
              required
              placeholder="Ej: juan@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={datos.telefono}
              onChange={handleChange}
              required
              placeholder="Ej: 555-123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección de entrega *</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={datos.direccion}
              onChange={handleChange}
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
                name="codigoPostal"
                value={datos.codigoPostal}
                onChange={handleChange}
                required
                placeholder="Ej: 12345"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ciudad">Ciudad *</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={datos.ciudad}
                onChange={handleChange}
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
              name="estado"
              value={datos.estado}
              onChange={handleChange}
              required
              placeholder="Ej: CDMX"
            />
          </div>

          <div className="form-group">
            <label htmlFor="instrucciones">Instrucciones de entrega (opcional)</label>
            <textarea
              id="instrucciones"
              name="instrucciones"
              value={datos.instrucciones}
              onChange={handleChange}
              placeholder="Ej: Tocar el timbre, dejar con el portero, etc."
              rows={3}
            />
          </div>
        </>
      )}

      <button 
        type="submit" 
        className="btn-continuar"
        disabled={isLoading}
      >
        {isLoading ? "Procesando..." : "Continuar al pago"}
      </button>
    </form>
  );
};

export default FormularioEnvio; 