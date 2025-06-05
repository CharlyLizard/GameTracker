import React, { useState } from 'react';
import { saveAuthData } from '../../services/storage/IndexedDbService';
import AuthService from '../../services/apis/AuthService';
import { getPublicIP } from '../../utils/IPApiUtil';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2FA states
  const [require2FA, setRequire2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const publicIp = await getPublicIP();
    const result = await AuthService.login(form.email, form.password, publicIp);
    
    if (result.ok && result.token && result.user) {
      await saveAuthData('token', result.token);
      await saveAuthData('user', result.user);
      console.log(result.user)
      window.location.href = '/home';
    } else if (result.require2FA && result.userId) {
      setRequire2FA(true);
      setUserId(result.userId);
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  } catch (err) {
    setError('Error inesperado');
  } finally {
    setLoading(false);
  }
};

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      const publicIp = await getPublicIP();
      const res = await AuthService.verify2FAWithLogin(userId, twoFACode, publicIp);
      console.log("[LOGIN FRONT] Respuesta del backend:", res);
      if (res.ok && res.token && res.user) {
        await saveAuthData('token', res.token);
        await saveAuthData('user', res.user);
        window.location.href = '/home';
      } else {
        setTwoFAError(res.error || 'Código 2FA incorrecto');
      }
    } catch (err) {
      setTwoFAError('Error inesperado');
    } finally {
      setTwoFALoading(false);
    }
  };

  if (require2FA) {
    return (
      <form onSubmit={handle2FAVerify}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="twoFACode" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#a78bfa' }}>
            Código 2FA
          </label>
          <input
            type="text"
            id="twoFACode"
            value={twoFACode}
            onChange={e => setTwoFACode(e.target.value)}
            style={{
              marginTop: '0.25rem',
              display: 'block',
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              color: '#d1d5db',
              fontSize: '1rem',
            }}
            placeholder="Introduce el código de 6 dígitos"
            maxLength={6}
            autoFocus
          />
        </div>
        {twoFAError && <div style={{ color: 'red', marginBottom: '1rem' }}>{twoFAError}</div>}
        <button
          type="submit"
          disabled={twoFALoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background 0.3s ease',
            opacity: twoFALoading ? 0.7 : 1,
          }}
          onMouseOver={e =>
            (e.target.style.background =
              'linear-gradient(to right, #7c3aed, #db2777)')
          }
          onMouseOut={e =>
            (e.target.style.background =
              'linear-gradient(to right, #8b5cf6, #ec4899)')
          }
        >
          {twoFALoading ? 'Verificando...' : 'Verificar 2FA'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#a78bfa' }}>
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          value={form.email}
          onChange={handleChange}
          style={{
            marginTop: '0.25rem',
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            color: '#d1d5db',
            fontSize: '1rem',
          }}
          placeholder="Ingresa tu correo"
        />
      </div>
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#a78bfa' }}>
          Contraseña
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={form.password}
          onChange={handleChange}
          style={{
            marginTop: '0.25rem',
            display: 'block',
            width: '100%',
            padding: '0.5rem 2.5rem 0.5rem 0.5rem', // espacio para el botón
            borderRadius: '0.375rem',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            color: '#d1d5db',
            fontSize: '1rem',
          }}
          placeholder="Ingresa tu contraseña"
        />
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          style={{
            position: 'absolute',
            top: '2.1rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            color: '#a78bfa',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: 0,
          }}
          tabIndex={-1}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
        <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
          <a
            href="/recovery"
            style={{
              color: '#a78bfa',
              fontSize: '0.9rem',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '0.375rem',
          background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'background 0.3s ease',
          opacity: loading ? 0.7 : 1,
        }}
        onMouseOver={e =>
          (e.target.style.background =
            'linear-gradient(to right, #7c3aed, #db2777)')
        }
        onMouseOut={e =>
          (e.target.style.background =
            'linear-gradient(to right, #8b5cf6, #ec4899)')
        }
      >
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};

export default Login;