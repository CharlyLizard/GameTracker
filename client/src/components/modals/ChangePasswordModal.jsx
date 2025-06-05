import React, { useState, useEffect } from "react";
import AuthService from "../../services/apis/AuthService";
import { getAuthData } from "../../services/storage/IndexedDbService";

// Utilidad simple para calcular la fuerza de la contraseña
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ["Muy débil", "Débil", "Regular", "Buena", "Fuerte"];

const ChangePasswordModal = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);

  useEffect(() => {
    getAuthData("user").then(user => {
      setRequire2FA(user?.twoFAEnabled || false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const token = await getAuthData("token");
    try {
      // Debes implementar este endpoint en el backend y en AuthService
      const res = await AuthService.changePassword(
        token,
        oldPassword,
        newPassword,
        require2FA ? twoFACode : undefined
      );
      if (res.ok) {
        setSuccess("¡Contraseña cambiada correctamente!");
        setOldPassword("");
        setNewPassword("");
        setTwoFACode("");
      } else {
        setError(res.error || "No se pudo cambiar la contraseña.");
      }
    } catch (err) {
      setError("Error inesperado");
    }
    setLoading(false);
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full border border-purple-700/30 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-400 hover:text-pink-400 text-xl"
        >✕</button>
        <h2 className="text-2xl font-bold text-purple-300 mb-4 text-center">Cambiar contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-purple-200 font-semibold mb-1">Contraseña actual</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-purple-600 text-white focus:outline-none"
              placeholder="Introduce tu contraseña actual"
            />
          </div>
          <div className="mb-4">
            <label className="block text-purple-200 font-semibold mb-1">Nueva contraseña</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-purple-600 text-white focus:outline-none"
              placeholder="Introduce tu nueva contraseña"
            />
            <div className="mt-2">
              <div className="w-full h-2 bg-gray-700 rounded">
                <div
                  className={`h-2 rounded transition-all duration-300`}
                  style={{
                    width: `${(strength / 5) * 100}%`,
                    background: [
                      "#f87171", // rojo
                      "#fbbf24", // amarillo
                      "#facc15", // amarillo fuerte
                      "#34d399", // verde claro
                      "#10b981"  // verde fuerte
                    ][strength - 1] || "#f87171"
                  }}
                />
              </div>
              <span className={`text-xs mt-1 block ${strength >= 4 ? "text-green-400" : "text-yellow-400"}`}>
                Seguridad: {strengthLabels[strength - 1] || "Muy débil"}
              </span>
            </div>
          </div>
          {require2FA && (
            <div className="mb-4">
              <label className="block text-purple-200 font-semibold mb-1">Código 2FA</label>
              <input
                type="text"
                maxLength={6}
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-purple-600 text-white focus:outline-none"
                placeholder="Introduce el código de 6 dígitos de tu app 2FA"
              />
            </div>
          )}
          {error && <div className="text-red-400 mb-2">{error}</div>}
          {success && <div className="text-green-400 mb-2">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg transition-all duration-300 mt-2"
          >
            {loading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;