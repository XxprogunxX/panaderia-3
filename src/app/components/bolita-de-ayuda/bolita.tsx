import React, { useState } from 'react';
import './bolita.css'; // Importa el CSS externo

const HelpPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [preferencia, setPreferencia] = useState<string | null>(null);
  const [dulzura, setDulzura] = useState<string | null>(null);

  const togglePopup = () => {
    setIsOpen(!isOpen);
    setStep(0);
    setPreferencia(null);
    setDulzura(null);
  };

  const obtenerRecomendacion = () => {
    if (preferencia === 'dulce' && dulzura === 'mucho') return 'Pan de chocolate';
    if (preferencia === 'dulce' && dulzura === 'poco') return 'Concha';
    if (preferencia === 'salado') return 'Bolillo o Telera';
    return 'Pan mixto';
  };

  return (
    <>
      <button onClick={togglePopup} className="popup-button">
        ¿Necesitas ayuda?
      </button>

      {isOpen && (
        <div className="popup-box">
          <h3 className="popup-title">Asistente de Pan</h3>

          {step === 0 && (
            <div>
              <p className="popup-text">¿Qué tipo de pan prefieres?</p>
              <div className="popup-options">
                <button onClick={() => { setPreferencia('dulce'); setStep(1); }}>
                  Dulce
                </button>
                <button onClick={() => { setPreferencia('salado'); setStep(2); }}>
                  Salado
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="popup-text">¿Qué tan dulce te gusta?</p>
              <div className="popup-options">
                <button onClick={() => { setDulzura('mucho'); setStep(3); }}>
                  Mucho
                </button>
                <button onClick={() => { setDulzura('poco'); setStep(3); }}>
                  Poco
                </button>
              </div>
            </div>
          )}

          {step === 2 || step === 3 ? (
            <div>
              <p className="popup-text">¡Perfecto! Te recomiendo:</p>
              <p className="popup-recomendacion">{obtenerRecomendacion()}</p>
              <button onClick={togglePopup} className="popup-close">Cerrar</button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default HelpPopup;
