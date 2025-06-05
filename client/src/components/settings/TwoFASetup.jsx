import React, { useState, useEffect } from "react";
import { getAuthData, saveAuthData } from "../../services/storage/IndexedDbService";
import AuthService from "../../services/apis/AuthService";

const TwoFASetup = ({ onClose, onActivated }) => {
  const [qr, setQr] = useState(null);
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState("");
  const [disableSuccess, setDisableSuccess] = useState(false);

  useEffect(() => {
    getAuthData("user").then(setUser);
  }, []);

  const startSetup = async () => {
    setError("");
    setLoading(true);
    const token = await getAuthData("token");
    const result = await AuthService.setup2FA(token);
    setLoading(false);
    if (!result.error) {
      setQr(result.qr);
    } else {
      setError(result.error || "Error al iniciar 2FA");
    }
  };

  useEffect(() => {
    if (user && !user.twoFAEnabled) {
      startSetup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const verifyCode = async () => {
    setError("");
    setLoading(true);
    const token = await getAuthData("token");
    const result = await AuthService.verify2FA(token, code);
    setLoading(false);
    if (result.ok) {
      setSuccess(true);
      let updatedUser = { ...user, twoFAEnabled: true };
      setUser(updatedUser);
      await saveAuthData("user", updatedUser);
      window.dispatchEvent(new Event("user-updated"));
      if (onActivated) onActivated();
    } else {
      setError(result.error || "Código incorrecto");
    }
  };

  const disable2FA = async () => {
    setDisableError("");
    setDisableLoading(true);
    const token = await getAuthData("token");
    const result = await AuthService.disable2FA(token);
    setDisableLoading(false);
    if (result.ok) {
      setDisableSuccess(true);
      let updatedUser = { ...user, twoFAEnabled: false };
      setUser(updatedUser);
      await saveAuthData("user", updatedUser);
      window.dispatchEvent(new Event("user-updated"));
      if (onActivated) onActivated();
    } else {
      setDisableError(result.error || "No se pudo desactivar el 2FA");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center my-4">
        <svg className="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-purple-200 mb-2">
        {user.twoFAEnabled ? "2FA activado" : "Activar 2FA"}
      </h3>
      {/* Activación */}
      {!user.twoFAEnabled && (
        <>
          {loading && (
            <div className="flex justify-center items-center my-4">
              <svg className="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
          {!loading && !success && qr && (
            <>
              <p className="mb-2 text-purple-200 font-semibold">
                Escanea este QR con Google Authenticator y escribe el código de 6 dígitos:
              </p>
              <img src={qr} alt="QR 2FA" className="mx-auto my-4 w-40 h-40" />
              <input
                type="text"
                placeholder="Código de 6 dígitos"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="border px-2 py-1 rounded text-black"
                maxLength={6}
              />
              <button
                onClick={verifyCode}
                className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded"
                disabled={loading}
              >
                Verificar
              </button>
              {error && <div className="text-red-400 mt-2">{error}</div>}
            </>
          )}
          {success && (
            <div className="text-green-400 font-bold mt-2">
              ¡2FA activado correctamente!
            </div>
          )}
        </>
      )}

      {/* Desactivación */}
      {user.twoFAEnabled && (
        <div className="mt-4">
          <button
            onClick={disable2FA}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-1 rounded"
            disabled={disableLoading}
          >
            {disableLoading ? "Desactivando..." : "Desactivar 2FA"}
          </button>
          {disableError && <div className="text-red-400 mt-2">{disableError}</div>}
          {disableSuccess && (
            <div className="text-green-400 mt-2">2FA desactivado correctamente.</div>
          )}
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-4 text-xs text-gray-400 hover:text-pink-400 underline"
      >
        Cerrar
      </button>
    </div>
  );
};

export default TwoFASetup;