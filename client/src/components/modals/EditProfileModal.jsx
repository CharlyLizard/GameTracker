import React, { useState, useEffect, useRef } from 'react';
import AuthService from '../../services/apis/AuthService';
import { getAuthData, saveAuthData } from '../../services/storage/IndexedDbService';

const MAX_AVATAR_SIZE_MB = 2;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MAX_BANNER_SIZE_MB = 5;
const MAX_BANNER_SIZE_BYTES = MAX_BANNER_SIZE_MB * 1024 * 1024;
const ALLOWED_BANNER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const PLATFORM_OPTIONS = ["PC", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch", "Móvil"];

const SERVER_URL = import.meta.env.PUBLIC_SOCKET_URL || 'http://localhost:5000'; // URL base del servidor

const EditProfileModal = ({ onClose, onProfileUpdated }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nombre, setNombre] = useState('');
  const [biografia, setBiografia] = useState('');
  const [juegoFavorito, setJuegoFavorito] = useState('');
  const [cumpleanos, setCumpleanos] = useState('');
  const [plataformas, setPlataformas] = useState([]);
  
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const avatarFileRef = useRef(null);

  const [bannerType, setBannerType] = useState('color');
  const [bannerColor, setBannerColor] = useState('#8b5cf6');
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const bannerFileRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getAuthData('user');
      if (user) {
        setCurrentUser(user);
        setNombre(user.nombre || '');
        setBiografia(user.biografia || '');
        setJuegoFavorito(user.juegoFavorito || '');
        setCumpleanos(user.cumpleanos ? new Date(user.cumpleanos).toISOString().split('T')[0] : '');
        setPlataformas(user.plataformas || []);
        
        setAvatarPreview(user.profileImageUrl || '');
        
        setBannerType(user.bannerType || 'color');
        setBannerColor(user.bannerColor || '#8b5cf6');
        setBannerImagePreview(user.bannerImageUrl || '');
      }
    };
    fetchUserData();
  }, []);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
        setError(`Avatar: Tipo de archivo no permitido. Sube JPG, PNG, WEBP o GIF.`);
        return;
      }
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
        setError(`Avatar: El archivo es demasiado grande. Máximo ${MAX_AVATAR_SIZE_MB}MB.`);
        return;
      }
      setError('');
      setSelectedAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_BANNER_TYPES.includes(file.type)) {
        setError(`Banner: Tipo de archivo no permitido. Sube JPG, PNG o WEBP.`);
        return;
      }
      if (file.size > MAX_BANNER_SIZE_BYTES) {
        setError(`Banner: El archivo es demasiado grande. Máximo ${MAX_BANNER_SIZE_MB}MB.`);
        return;
      }
      setError('');
      setSelectedBannerFile(file);
      setBannerImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePlatformChange = (platform) => {
    setPlataformas(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = await getAuthData('token');
    if (!token) { setLoading(false); setError("Error de autenticación."); return; }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('biografia', biografia);
    formData.append('juegoFavorito', juegoFavorito);
    if (cumpleanos) formData.append('cumpleanos', cumpleanos);
    plataformas.forEach(p => formData.append('plataformas[]', p));

    if (selectedAvatarFile) {
      formData.append('profileImageFile', selectedAvatarFile);
    } else if (avatarPreview === '') { 
        formData.append('profileImageUrl', ''); 
    }

    formData.append('bannerType', bannerType);
    if (bannerType === 'color') {
      formData.append('bannerColor', bannerColor);
    } else if (bannerType === 'image' && selectedBannerFile) {
      formData.append('bannerImageFile', selectedBannerFile);
    } else if (bannerType === 'image' && bannerImagePreview === '') {
        formData.append('bannerImageUrl', '');
    }

    try {
      const response = await AuthService.updateProfile(token, formData);
      if (response.ok && response.user) {
        setSuccess('Perfil actualizado correctamente.');
        await saveAuthData('user', response.user);
        setCurrentUser(response.user);
        if (onProfileUpdated) onProfileUpdated(response.user);
        window.dispatchEvent(new Event('user-updated'));
        
        setAvatarPreview(response.user.profileImageUrl || '');
        setSelectedAvatarFile(null);
        if (avatarFileRef.current) avatarFileRef.current.value = "";

        if (response.user.bannerType === 'image') {
            setBannerImagePreview(response.user.bannerImageUrl || '');
        }
        setSelectedBannerFile(null);
        if (bannerFileRef.current) bannerFileRef.current.value = "";
      } else {
        setError(response.error || 'Error al actualizar el perfil.');
      }
    } catch (err) {
      console.error('[EditProfileModal] error:', err);
      setError('Error inesperado al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${SERVER_URL}${url}`;
    return url;
  };

  const finalAvatarSrc = selectedAvatarFile 
    ? avatarPreview
    : avatarPreview
      ? getFullImageUrl(avatarPreview)
      : `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(nombre || "user")}`;
  
  const bannerImageUrlForStyle = selectedBannerFile
    ? bannerImagePreview
    : bannerImagePreview
      ? getFullImageUrl(bannerImagePreview)
      : 'default_banner_placeholder.png';

  const finalBannerStyle = bannerType === 'image'
    ? { backgroundImage: `url(${bannerImageUrlForStyle})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: bannerColor };

  if (!currentUser) return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"><div className="bg-gray-800 p-8 rounded-lg shadow-xl text-white">Cargando...</div></div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl border border-purple-700/30 my-8 flex flex-col md:flex-row max-h-[90vh]">
        
        <div className="w-full md:w-1/3 bg-gray-900/30 p-6 flex flex-col items-center justify-start rounded-l-xl overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700">
          <h3 className="text-xl font-bold text-purple-300 mb-6 text-center">Vista Previa</h3>
          <div className="w-full max-w-xs">
            <div 
              className="h-32 w-full rounded-t-lg bg-cover bg-center mb-[-48px]"
              style={finalBannerStyle}
            ></div>
            <div className="relative flex flex-col items-center bg-gray-800/50 p-4 rounded-b-lg shadow-md pt-0">
              <img
                src={finalAvatarSrc}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-full border-4 border-gray-800 shadow-lg object-cover bg-gray-700 -mt-12 mb-3"
              />
              <h4 className="text-lg font-bold text-purple-200 text-center">{nombre || "Nombre de Usuario"}</h4>
              
              {juegoFavorito && (
                <p className="text-xs text-pink-400 mt-1 text-center">
                  <span className="font-semibold">Juego Favorito:</span> {juegoFavorito}
                </p>
              )}
              
              {biografia && (
                <div className="mt-3 w-full">
                  <p className="text-sm text-gray-300 text-center max-h-24 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-600" placeholder="Cuéntanos algo sobre ti..."></p>
                </div>
              )}
              
              {cumpleanos && (
                <p className="text-xs text-gray-400 mt-2">
                  <span className="font-semibold">Cumpleaños:</span> {new Date(cumpleanos + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
              
              {plataformas.length > 0 && (
                <div className="mt-3 w-full">
                  <p className="text-sm text-purple-300 font-semibold text-center mb-1">Plataformas:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {plataformas.map(p => (
                      <span key={p} className="text-xs bg-purple-700/60 text-purple-200 px-2.5 py-1 rounded-full shadow">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700 relative">
          <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-pink-400 text-3xl font-light z-10">&times;</button>
          <h2 className="text-3xl font-bold text-purple-300 mb-8 text-center md:text-left">Editar Perfil</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nombre" className="block text-purple-200 font-semibold mb-1.5">Nombre de Usuario</label>
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2.5 rounded-md bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" required />
            </div>

            <div>
              <label htmlFor="biografia" className="block text-purple-200 font-semibold mb-1.5">Biografía</label>
              <textarea id="biografia" value={biografia} onChange={(e) => setBiografia(e.target.value)} rows="3" className="w-full px-4 py-2.5 rounded-md bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-600" placeholder="Cuéntanos algo sobre ti..."></textarea>
            </div>

            <div>
              <label htmlFor="juegoFavorito" className="block text-purple-200 font-semibold mb-1.5">Juego Favorito</label>
              <input type="text" id="juegoFavorito" value={juegoFavorito} onChange={(e) => setJuegoFavorito(e.target.value)} className="w-full px-4 py-2.5 rounded-md bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="Ej: Cyberpunk 2077" />
            </div>

            <div>
              <label htmlFor="cumpleanos" className="block text-purple-200 font-semibold mb-1.5">Fecha de Nacimiento</label>
              <input type="date" id="cumpleanos" value={cumpleanos} onChange={(e) => setCumpleanos(e.target.value)} className="w-full px-4 py-2.5 rounded-md bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
            </div>

            <div>
              <label className="block text-purple-200 font-semibold mb-2">Plataformas de Juego</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PLATFORM_OPTIONS.map(platform => (
                  <label key={platform} className="flex items-center space-x-2.5 p-2.5 bg-gray-700/60 rounded-lg hover:bg-gray-700/90 cursor-pointer transition-colors border border-transparent hover:border-purple-500/50">
                    <input type="checkbox" checked={plataformas.includes(platform)} onChange={() => handlePlatformChange(platform)} className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer" />
                    <span className="text-sm text-gray-200">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label htmlFor="avatarFile" className="block text-purple-200 font-semibold mb-1.5">Imagen de Perfil (Máx {MAX_AVATAR_SIZE_MB}MB)</label>
              <input type="file" id="avatarFile" ref={avatarFileRef} accept={ALLOWED_AVATAR_TYPES.join(',')} onChange={handleAvatarFileChange} className="block w-full text-sm text-gray-300 cursor-pointer bg-gray-700/80 border border-gray-600 rounded-md focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-colors" />
              {avatarPreview && !selectedAvatarFile && (
                 <input type="text" value={getFullImageUrl(avatarPreview)} onChange={(e) => {setAvatarPreview(e.target.value); setSelectedAvatarFile(null); if(avatarFileRef.current) avatarFileRef.current.value = "";}} placeholder="O pega una URL de imagen" className="mt-2 w-full px-4 py-2.5 rounded-md bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"/>
              )}
            </div>
            
            <div className="border-t border-gray-700 pt-5 mt-3">
              <label className="block text-purple-200 font-semibold mb-2.5">Personalización del Banner</label>
              <div className="flex items-center gap-x-6 gap-y-2 mb-3 flex-wrap">
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="bannerType" value="color" checked={bannerType === 'color'} onChange={() => setBannerType('color')} className="h-4 w-4 rounded-full border-gray-500 bg-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"/>
                  <span className="ml-2 text-gray-200">Color Sólido</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="bannerType" value="image" checked={bannerType === 'image'} onChange={() => setBannerType('image')} className="h-4 w-4 rounded-full border-gray-500 bg-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"/>
                  <span className="ml-2 text-gray-200">Imagen</span>
                </label>
              </div>

              {bannerType === 'color' && (
                <div className="flex items-center gap-3">
                  <input type="color" value={bannerColor} onChange={(e) => setBannerColor(e.target.value)} className="w-12 h-10 p-1 border border-gray-600 rounded-md bg-gray-700/80 cursor-pointer"/>
                  <input type="text" value={bannerColor} onChange={(e) => setBannerColor(e.target.value)} className="w-full px-4 py-2.5 rounded-md bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" placeholder="#8b5cf6" maxLength={7}/>
                </div>
              )}

              {bannerType === 'image' && (
                <div>
                  <input type="file" id="bannerFile" ref={bannerFileRef} accept={ALLOWED_BANNER_TYPES.join(',')} onChange={handleBannerFileChange} className="block w-full text-sm text-gray-300 cursor-pointer bg-gray-700/80 border border-gray-600 rounded-md focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 transition-colors" />
                  <p className="text-xs text-gray-500 mt-1.5">Sube JPG, PNG, WEBP (Máx {MAX_BANNER_SIZE_MB}MB).</p>
                   {bannerImagePreview && !selectedBannerFile && (
                    <input type="text" value={getFullImageUrl(bannerImagePreview)} onChange={(e) => {setBannerImagePreview(e.target.value); setSelectedBannerFile(null); if(bannerFileRef.current) bannerFileRef.current.value = "";}} placeholder="O pega una URL de imagen para el banner" className="mt-2 w-full px-4 py-2.5 rounded-md bg-gray-700/80 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"/>
                  )}
                </div>
              )}
            </div>

            {error && <div className="text-red-300 my-3 p-3.5 bg-red-500/20 rounded-lg border border-red-500/40 text-sm shadow">{error}</div>}
            {success && <div className="text-green-300 my-3 p-3.5 bg-green-500/20 rounded-lg border border-green-500/40 text-sm shadow">{success}</div>}

            <button type="submit" disabled={loading} className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-6 text-base">
              {loading ? 'Guardando Cambios...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;