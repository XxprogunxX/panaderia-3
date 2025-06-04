import React from 'react';

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

interface FormularioEnvioProps {
  onSubmit: (datos: DatosEnvio) => void;
  isLoading: boolean;
}

const FormularioEnvio: React.FC<FormularioEnvioProps> = ({ onSubmit, isLoading }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(datos);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-envio">
      <h3>Datos de Envío</h3>
      
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