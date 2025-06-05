import React, { useState } from "react";
import AuthService from "../../services/apis/AuthService";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviado(false);
    setPreviewUrl("");
    try {
      const res = await AuthService.solicitarRecuperacion(email);
      if (res.ok) {
        setEnviado(true);
        if (res.emailPreviewUrl) {
          setPreviewUrl(res.emailPreviewUrl);
          setShowPopup(true);
        }
      } else {
        setError(res.error || "No se pudo enviar el correo.");
      }
    } catch (err) {
      setError("Error inesperado");
    }
  };

  const openEmail = () => {
    const popup = window.open(previewUrl, "EmailRecovery", "width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes");
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      alert("Tu navegador ha bloqueado la ventana emergente. Permite popups para ver el correo.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-purple-200 font-semibold mb-1">Correo electrónico</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg transition-all duration-300"
        >
          Enviar instrucciones
        </button>
      </form>
      {enviado && (
        <div className="mt-6 text-center text-green-400">
          ¡Correo de recuperación enviado!<br />
          {previewUrl && (
            <button
              onClick={openEmail}
              className="mt-4 underline text-purple-300 hover:text-pink-400 block"
            >
              Ver correo de recuperación (vista previa)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordRecovery;