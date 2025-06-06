import React, { useState, useEffect } from "react";
import AuthService from "../../services/apis/AuthService";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [token, setToken] = useState("");

  // filepath: client/src/components/Cauth/ResetPassword.jsx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);

    if (t) {
      fetch(`${import.meta.env.PUBLIC_API_URL}/auth/2fa/check-2fa?token=${t}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Respuesta check-2fa:", data); 
          setRequire2FA(!!data.twoFAEnabled);
        })
        .catch(() => setRequire2FA(false));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setLoading(true);
    if (!token) {
      setError("Faltan datos obligatorios");
      setLoading(false);
      return;
    }
    if (require2FA && !twoFACode) {
      setError("Por favor, introduce el código 2FA.");
      setLoading(false);
      return;
    }
    const res = await AuthService.resetPassword(
      token,
      password,
      require2FA ? twoFACode : ""
    );
    setLoading(false);
    if (res.ok) {
      setExito("¡Contraseña restablecida correctamente! Ya puedes iniciar sesión.");
    } else {
      setError(res.error || "No se pudo restablecer la contraseña.");
    }
  };

  if (exito) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-purple-300 mb-4">{exito}</h2>
        <a
          href="/auth"
          className="inline-block mt-4 py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition-all duration-300 shadow-lg"
        >
          Ir al inicio de sesión
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-purple-200 font-semibold mb-1">
          Nueva contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-700 border border-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Introduce tu nueva contraseña"
        />
      </div>
      {require2FA && (
        <div className="mb-4">
          <label className="block text-purple-200 font-semibold mb-1">
            Código 2FA
          </label>
          <input
            type="text"
            maxLength={6}
            value={twoFACode}
            onChange={(e) => setTwoFACode(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Introduce el código de 6 dígitos de tu app 2FA"
            autoFocus
          />
          {error === "Por favor, introduce el código 2FA." && (
            <div className="text-red-400 mt-2">{error}</div>
          )}
        </div>
      )}
      {error && error !== "Por favor, introduce el código 2FA." && (
        <div className="text-red-400 mb-2">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg transition-all duration-300"
      >
        {loading ? "Restableciendo..." : "Restablecer contraseña"}
      </button>
    </form>
  );
};

export default ResetPassword;