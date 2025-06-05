import React, { useState, useEffect } from 'react';
import { getAuthData } from '../../services/storage/IndexedDbService';
import EditProfileModal from '../modals/EditProfileModal.jsx';
import { getUserAchievements } from '../../services/apis/AchievementService'; // Importar el servicio
import { TrophyIcon as DefaultTrophyIcon } from '../../icons/Icons'; // Un icono por defecto

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userAchievements, setUserAchievements] = useState([]); // Estado para logros del usuario
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const SERVER_URL = import.meta.env.PUBLIC_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const userData = await getAuthData('user');
      if (userData) {
        setUser(userData);
        try {
          // Cargar los logros del usuario
          const achievementsData = await getUserAchievements(); // Llama a /api/achievements/me
          setUserAchievements(achievementsData.achievements || []);
        } catch (error) {
          console.error("Error fetching user achievements for profile:", error);
          setUserAchievements([]); // Asegurar que sea un array
        }
      }
      setLoading(false);
    };
    loadData();

    const handleUserUpdate = async () => {
      const updatedUserData = await getAuthData('user');
      setUser(updatedUserData);
      // Podrías recargar los logros aquí también si fuera necesario
    };
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    setShowEditModal(false);
  };

  if (loading) {
    return <div className="text-center p-10 text-purple-300">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="text-center p-10 text-red-400">No se pudo cargar el perfil del usuario.</div>;
  }

  const bannerStyle = user.bannerType === 'image' && user.bannerImageUrl
    ? { backgroundImage: `url(${user.bannerImageUrl.startsWith('/') ? `${SERVER_URL}${user.bannerImageUrl}` : user.bannerImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: user.bannerColor || '#8b5cf6' };

  const avatarSrc = user.profileImageUrl
    ? (user.profileImageUrl.startsWith('/') ? `${SERVER_URL}${user.profileImageUrl}` : user.profileImageUrl)
    : `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(user.nombre || "user")}`;

  // Tomar, por ejemplo, los últimos 5 logros desbloqueados
  const recentAchievements = userAchievements.slice(0, 5);

  return (
    <>
      {!user.twoFAEnabled && (
        <div className="w-full mb-4"> {/* Modificado: sin max-width, mx-auto, mt-6 */}
          <div className="bg-yellow-600/20 border border-yellow-500/50 text-yellow-100 px-4 py-3 rounded-lg shadow-md" role="alert">
            <div className="flex items-center">
              <div className="py-1">
                <svg className="fill-current h-6 w-6 text-yellow-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">¡Atención!</p>
                <p className="text-sm">La autenticación de dos factores (2FA) no está activada. Actívala para mayor seguridad.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800/70 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden border border-purple-500/20 w-full"> {/* Modificado: w-full, sin max-width, mx-auto, my-8 */}
        <div
          className="relative h-56 md:h-72 group"
          style={bannerStyle}
        >
          {/* Espacio para el banner */}
        </div>

        <div className="p-6 md:p-8 relative">
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 md:left-8 md:transform-none md:-translate-x-0">
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-gray-800 shadow-lg object-cover bg-gray-700"
            />
          </div>

          <div className="text-right -mt-4 md:mt-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              Editar Perfil
            </button>
          </div>

          <div className="mt-16 md:mt-8">
            <p className="text-3xl font-bold text-purple-200">
              {user.nickname}
              <span className="text-purple-400">#{user.tag}</span>
            </p>
            <p className="text-3xl  text-purple-200">{user.nombre}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
            
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              {user.verified && (
                <span className="text-xs bg-green-700/40 text-green-300 px-2 py-0.5 rounded-full">
                  Verificado
                </span>
              )}
              {!user.verified && (
                <span className="text-xs bg-yellow-700/40 text-yellow-300 px-2 py-0.5 rounded-full">
                  No Verificado
                </span>
              )}
              {user.twoFAEnabled && (
                <span className="text-xs bg-sky-700/40 text-sky-300 px-2 py-0.5 rounded-full">
                  2FA Activo
                </span>
              )}
            </div>


            <div className="mt-6 space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-purple-300">Sobre mí</h3>
                <p className="text-sm whitespace-pre-wrap break-words">{user.biografia || "No hay biografía disponible."}</p>
              </div>
              <div>
                <h3 className="font-semibold text-purple-300">Juego Favorito</h3>
                <p className="text-sm">{user.juegoFavorito || "No especificado."}</p>
              </div>
              {user.cumpleanos && (
                <div>
                  <h3 className="font-semibold text-purple-300">Fecha de Nacimiento</h3>
                  {/* Añadimos 'T00:00:00' para evitar problemas de zona horaria al parsear solo la fecha */}
                  <p className="text-sm">{new Date(user.cumpleanos + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
              {user.plataformas && user.plataformas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-purple-300">Mis Plataformas</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.plataformas.map((platform) => (
                      <span key={platform} className="text-xs bg-gray-700 text-purple-200 px-2 py-1 rounded-full">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
               <div>
                <h3 className="font-semibold text-purple-300">Miembro desde</h3>
                <p className="text-sm">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {showEditModal && (
        <EditProfileModal
          currentUser={user}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </>
  );
};

export default UserProfile;