import React, { useState } from 'react';
import AuthService from '../../services/apis/AuthService';

const Registro = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    nickname: '', // Añadido nickname
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [emailUrl, setEmailUrl] = useState('');
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      // Solo enviamos los campos requeridos por el backend
      const payload = {
        nombre: form.nombre,
        nickname: form.nickname,
        email: form.email,
        password: form.password,
      };
      const response = await AuthService.registrarUsuario(payload);
      window.sessionStorage.setItem('showVerifyNotification', 'true');
      if (response.emailPreviewUrl) {
        setEmailUrl(response.emailPreviewUrl);
        setShowEmailPopup(true);
      } else {
        window.location.href = '/home';
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openEmail = () => {
    const popupFeatures =
      'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes';
    const popup = window.open(emailUrl, 'EmailVerification', popupFeatures);
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      alert('Tu navegador ha bloqueado la ventana emergente. Por favor, permite ventanas emergentes para este sitio.');
      window.location.href = '/home';
    } else {
      setTimeout(() => {
        window.location.href = '/home';
      }, 1000);
    }
  };

  const EmailPopup = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#2d3748',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ color: '#a78bfa', fontSize: '1.25rem', marginBottom: '1rem' }}>
          ¡Registro completado!
        </h3>
        <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
          Hemos enviado un correo de verificación. ¿Deseas ver el correo ahora?
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => window.location.href = '/home'}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            No, ir a la página principal
          </button>
          <button
            onClick={openEmail}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Ver el correo
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="nombre" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#a78bfa' }}>
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            value={form.nombre}
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
            placeholder="Ingresa tu nombre"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="nickname" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#a78bfa' }}>
            Nickname
          </label>
          <input
            type="text"
            id="nickname"
            value={form.nickname}
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
            placeholder="Elige tu nickname"
            required
          />
        </div>
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
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#a78bfa' }}>
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={form.password}
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
            placeholder="Crea una contraseña"
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        {exito && <div style={{ color: 'green', marginBottom: '1rem' }}>{exito}</div>}
        <button
          type="submit"
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
          }}
          onMouseOver={(e) =>
            (e.target.style.background =
              'linear-gradient(to right, #7c3aed, #db2777)')
          }
          onMouseOut={(e) =>
            (e.target.style.background =
              'linear-gradient(to right, #8b5cf6, #ec4899)')
          }
        >
          Crear Cuenta
        </button>
      </form>
      {showEmailPopup && <EmailPopup />}
    </>
  );
};

export default Registro;