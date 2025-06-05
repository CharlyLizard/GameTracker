import React, { useEffect, useState } from "react";
import AuthService from "../../services/apis/AuthService";

const VerifyResult = () => {
    const [verified, setVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      // Obtener el token directamente del navegador
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
  
      if (!token) {
        setErrorMessage("Token no proporcionado.");
        setLoading(false);
        return;
      }
  
      // Puedes dejar el setTimeout si quieres el spinner
      setTimeout(() => {
        AuthService.verificarCuenta(token).then((result) => {
          if (result.ok) {
            setVerified(true);
          } else {
            setErrorMessage(result.error || "El enlace de verificación no es válido o ya ha expirado.");
          }
        }).finally(() => setLoading(false));
      }, 2000);
    }, []);
  
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <div className="text-center text-purple-300">Verificando tu cuenta...</div>
        </div>
      );
    }

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8 border border-purple-700/30">
      {verified ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-purple-300 mb-4">¡Cuenta verificada!</h2>
          <p className="text-gray-300 mb-8">
            Tu cuenta ha sido verificada correctamente. Ya puedes disfrutar de todas las funcionalidades de GameTracker.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-300 mb-4">Error de verificación</h2>
          <p className="text-gray-300 mb-8">
            {errorMessage}
          </p>
        </div>
      )}

      <button
        id="closeButton"
        className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition-all duration-300 shadow-lg"
        onClick={() => {
          if (window.opener && !window.opener.closed) {
            window.close();
          } else {
            window.location.href = '/auth';
          }
        }}
      >
        {verified ? 'Ir a inicio de sesión' : 'Volver a intentarlo'}
      </button>
    </div>
  );
};

export default VerifyResult;