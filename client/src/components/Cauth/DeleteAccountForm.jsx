import React, { useState } from "react";
import AuthService from "../../services/apis/AuthService";
import { getAuthData, removeAuthData } from "../../services/storage/IndexedDbService";

const DeleteAccountForm = () => {
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Si tu app guarda si el usuario tiene 2FA activado, puedes obtenerlo aquí
  const [require2FA, setRequire2FA] = useState(false);

  React.useEffect(() => {
    getAuthData("user").then(user => setRequire2FA(user?.twoFAEnabled));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = await getAuthData("token");
      console.log("[DeleteAccountForm] token:", token);
      console.log("[DeleteAccountForm] password:", password);
      console.log("[DeleteAccountForm] require2FA:", require2FA);
      console.log("[DeleteAccountForm] twoFACode:", twoFACode);

      const response = await AuthService.deleteAccount(
        token,
        password,
        require2FA ? twoFACode : undefined
      );
      console.log("[DeleteAccountForm] response:", response);

      if (response.ok) {
        setSuccess("Cuenta eliminada correctamente.");
        await removeAuthData("token");
        await removeAuthData("user");
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      } else {
        setError(response.error || "Error al eliminar la cuenta");
      }
    } catch (err) {
      console.error("[DeleteAccountForm] error:", err);
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-gray-400 mb-2 font-semibold">Introduce tu contraseña para confirmar:</label>
      <input
        type="password"
        className="w-full px-4 py-2 rounded bg-gray-800 border border-red-400 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {require2FA && (
        <>
          <label className="block text-gray-400 mb-2 font-semibold">Código 2FA:</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded bg-gray-800 border border-red-400 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Código de 6 dígitos"
            value={twoFACode}
            onChange={e => setTwoFACode(e.target.value)}
            required
            maxLength={6}
          />
        </>
      )}
      <div className="bg-yellow-900/40 border-l-4 border-yellow-400 text-yellow-200 p-4 rounded mb-4">
        <strong>Recuerda:</strong> Si tienes 2FA activado, elimina el código de GameTracker de tu app de autenticación móvil.
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {success && <div className="text-green-400 mb-2">{success}</div>}
      <button
        type="submit"
        className="w-full py-3 rounded bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold shadow-lg transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Eliminando..." : "Eliminar cuenta definitivamente"}
      </button>
    </form>
  );
};

export default DeleteAccountForm;