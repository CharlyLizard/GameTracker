import React, { useState } from 'react';
import Login from './Login.jsx';
import Registro from './Registro.jsx';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="bg-gray-800 shadow-2xl rounded-lg p-8 max-w-4xl w-full flex">
        {/* Imagen a la izquierda */}
        <div className="hidden md:block w-1/2">
          <img
            src="/Imagen_Login.png"
            alt="Imagen decorativa"
            className="rounded-l-lg object-cover h-full"
          />
        </div>

        {/* Formulario a la derecha */}
        <div className="w-full md:w-1/2 p-6">
          {/* Botones de alternancia */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-700 rounded-full p-1">
              <button
                className={`px-6 py-2 rounded-full font-bold ${
                  isLogin ? 'bg-black text-white' : 'text-gray-400'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`px-6 py-2 rounded-full font-bold ${
                  !isLogin ? 'bg-black text-white' : 'text-gray-400'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Registro
              </button>
            </div>
          </div>

          {/* Renderizado condicional */}
          {isLogin ? <Login /> : <Registro />}
        </div>
      </div>
    </div>
  );
};

export default Auth;