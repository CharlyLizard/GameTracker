// filepath: client/src/components/achievements/AchievementsDisplay.jsx
import React, { useState, useEffect } from 'react';
import { getAllAchievements, getUserAchievements } from '../../services/apis/AchievementService'; // Necesitarás crear este servicio
import { getAuthData } from '../../services/storage/IndexedDbService';

// Icono genérico para logros si no se especifica uno o no se carga
const DefaultTrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AchievementCard = ({ achievement, unlocked, unlockDate }) => {
  const cardClass = unlocked
    ? "bg-gradient-to-br from-purple-700 via-purple-800 to-gray-800 border-purple-500 shadow-purple-500/30"
    : "bg-gray-800 border-gray-700 opacity-60 hover:opacity-100 transition-opacity";
  
  const iconHtml = achievement.icono && achievement.icono.startsWith('<svg') 
    ? { __html: achievement.icono } // Si el icono es un SVG completo
    : achievement.icono && achievement.icono.startsWith('fas') 
    ? <i className={`${achievement.icono} fa-2x ${unlocked ? 'text-yellow-300' : 'text-gray-500'}`}></i> // Si es una clase FontAwesome
    : <DefaultTrophyIcon />;

  return (
    <div className={`p-5 rounded-xl border-2 shadow-lg flex items-start gap-4 ${cardClass}`}>
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-black/20">
        {iconHtml}
      </div>
      <div className="flex-grow">
        <h3 className={`text-xl font-bold ${unlocked ? 'text-yellow-200' : 'text-gray-300'}`}>{achievement.nombre}</h3>
        <p className={`text-sm mt-1 ${unlocked ? 'text-purple-200' : 'text-gray-400'}`}>{achievement.descripcion}</p>
        {achievement.criterio?.descripcionCriterio && (
          <p className={`text-xs mt-1 italic ${unlocked ? 'text-purple-300' : 'text-gray-500'}`}>
            Cómo desbloquear: {achievement.criterio.descripcionCriterio}
          </p>
        )}
        <div className="mt-2 flex justify-between items-center">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${unlocked ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-600 text-gray-300'}`}>
            {achievement.puntos || 0} Puntos
          </span>
          {unlocked && unlockDate && (
            <span className="text-xs text-green-300">
              Desbloqueado: {new Date(unlockDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AchievementsDisplay() {
  const [allAchievements, setAllAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const userData = await getAuthData('user');
      if (!userData) {
        window.location.href = '/auth'; // Redirigir si no está autenticado
        return;
      }
      setCurrentUser(userData);

      try {
        setLoading(true);
        const [allAchievementsData, userAchievementsData] = await Promise.all([
          getAllAchievements(),
          getUserAchievements() // Asume que getUserAchievements sin ID obtiene los del usuario autenticado
        ]);
        
        setAllAchievements(allAchievementsData.achievements || []);
        setUserAchievements(userAchievementsData.achievements || []);
        
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError(err.message || 'No se pudieron cargar los logros.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return <p className="text-center text-purple-300 text-xl">Cargando logros...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400 text-xl">Error: {error}</p>;
  }

  const mergedAchievements = allAchievements.map(ach => {
    const userAch = userAchievements.find(ua => ua._id === ach._id); // Compara por el ID del logro base
    return {
      ...ach,
      unlocked: !!userAch,
      unlockDate: userAch ? userAch.fechaObtencion : null,
    };
  }).sort((a, b) => { // Opcional: ordenar, por ejemplo, desbloqueados primero
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return (b.puntos || 0) - (a.puntos || 0); // Luego por puntos
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mergedAchievements.length > 0 ? (
        mergedAchievements.map(ach => (
          <AchievementCard 
            key={ach._id} 
            achievement={ach} 
            unlocked={ach.unlocked}
            unlockDate={ach.unlockDate}
          />
        ))
      ) : (
        <p className="text-center text-gray-400 col-span-full">No hay logros definidos o no se pudieron cargar.</p>
      )}
    </div>
  );
}