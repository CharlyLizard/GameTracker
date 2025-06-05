import React, { useState } from "react";
import ChangePasswordModal from "../modals/ChangePasswordModal.jsx";
import TwoFASetup from "../settings/TwoFASetup.jsx"; 
import ActiveSessionsSummary from "../Cauth/ActiveSessionsSummary.jsx";

const AccountSecurity = () => {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Icono de Escudo para el título
  const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-pink-400 group-hover:text-pink-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  return (
    // Contenedor principal del card. Se eliminó el div anidado innecesario.
    <div className="bg-gray-800/60 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-purple-500/40">
      <h2 className="text-2xl font-bold text-purple-300 mb-8 flex items-center group cursor-default">
        <ShieldIcon />
        Seguridad de la Cuenta
      </h2>

      <div className="space-y-6">
        {/* Sección Contraseña */}
        <div className="bg-gray-700/40 hover:bg-gray-700/60 transition-colors duration-300 p-5 rounded-xl border border-gray-600/50 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="mb-3 sm:mb-0">
              <h3 className="text-lg font-semibold text-purple-200">Contraseña</h3>
              <p className="text-sm text-gray-400 mt-1">
                Mantén tu cuenta segura con una contraseña fuerte y única.
              </p>
            </div>
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium py-2 px-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm whitespace-nowrap"
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Sección 2FA */}
        <div className="bg-gray-700/40 hover:bg-gray-700/60 transition-colors duration-300 p-5 rounded-xl border border-gray-600/50 shadow-md">
          <h3 className="text-lg font-semibold text-purple-200 mb-1">Autenticación en Dos Pasos (2FA)</h3>
          <p className="text-sm text-gray-400 mb-4">
            Añade una capa adicional de seguridad. Se requerirá un código de tu app de autenticación al iniciar sesión.
          </p>
          <TwoFASetup 
            onClose={() => { /* Lógica si TwoFASetup maneja un cierre */ }} 
            onActivated={() => { /* Lógica al activar/desactivar 2FA, ej. para refrescar el estado del usuario */ }} 
          />
        </div>

        {/* Sección Sesiones Activas */}
        <div className="bg-gray-700/40 hover:bg-gray-700/60 transition-colors duration-300 p-5 rounded-xl border border-gray-600/50 shadow-md">
          <h3 className="text-lg font-semibold text-purple-200 mb-1">Sesiones Activas</h3>
          <p className="text-sm text-gray-400 mb-4">
            Revisa y gestiona los dispositivos donde has iniciado sesión. Cierra sesiones que no reconozcas.
          </p>
          <ActiveSessionsSummary />
        </div>
      </div>

      {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />}
    </div>
  );
};

export default AccountSecurity;