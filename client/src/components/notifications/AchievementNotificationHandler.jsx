import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { getAuthData } from '../../services/storage/IndexedDbService';
import { getInboxMessages, markMessageRead } from '../../services/apis/BuzonService'; // Necesitarás crear o asegurar que este servicio exista

const ACHIEVEMENT_SUBJECT_KEY = "¡Nuevo Logro Desbloqueado!"; // Coincide con el subject del backend
const POLLING_INTERVAL = 30000; // 30 segundos (ajusta según necesidad)
const SHOWN_ACHIEVEMENT_MESSAGES_KEY = 'shownAchievementMessageIds';

const AchievementToast = ({ achievementName, achievementIcon }) => {
  const iconHtml = achievementIcon && achievementIcon.startsWith('<svg') 
    ? { __html: achievementIcon }
    : achievementIcon && achievementIcon.startsWith('fas') 
    ? <i className={`${achievementIcon} fa-lg mr-2 text-yellow-300`}></i>
    : <i className="fas fa-trophy fa-lg mr-2 text-yellow-300"></i>; // Icono por defecto

  return (
    <div className="flex items-center">
      {iconHtml}
      <div>
        <p className="font-bold">¡Logro Desbloqueado!</p>
        <p className="text-sm">{achievementName}</p>
      </div>
    </div>
  );
};

export default function AchievementNotificationHandler() {
  const [user, setUser] = useState(null);
  const audioRef = useRef(null);
  const lastCheckedTimestampRef = useRef(Date.now()); // Para buscar solo mensajes nuevos desde la última vez

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getAuthData('user');
      setUser(userData);
    };
    loadUser();

    // Precargar el audio
    audioRef.current = new Audio('/sounds/achievement_unlocked.mp3'); // Asegúrate que la ruta es correcta
    audioRef.current.load(); // Inicia la carga del audio

  }, []);

  useEffect(() => {
    if (!user) return;

    const getShownMessageIds = () => {
      const stored = sessionStorage.getItem(SHOWN_ACHIEVEMENT_MESSAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    };

    const addShownMessageId = (messageId) => {
      const ids = getShownMessageIds();
      sessionStorage.setItem(SHOWN_ACHIEVEMENT_MESSAGES_KEY, JSON.stringify([...ids, messageId]));
    };

    const fetchAndNotify = async () => {
      try {
        const token = await getAuthData('token');
        if (!token) return;

        const response = await getInboxMessages(token); // Asume que getInboxMessages devuelve { mensajes: [...] }
        const messages = response.mensajes || [];
        
        const newAchievementMessages = messages.filter(msg => 
          msg.subject === ACHIEVEMENT_SUBJECT_KEY &&
          !msg.read && // Considerar solo no leídos o una lógica más robusta
          new Date(msg.date) > new Date(lastCheckedTimestampRef.current) && // Solo más nuevos que la última revisión
          !getShownMessageIds().includes(msg._id)
        );

        if (newAchievementMessages.length > 0) {
          // Ordenar por fecha para mostrar el más reciente primero si hay varios
          newAchievementMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          for (const achievementMessage of newAchievementMessages) {
            // Extraer nombre del logro del cuerpo del mensaje (esto es frágil, idealmente el backend enviaría datos estructurados)
            // Ejemplo: "¡Felicidades! Has desbloqueado el logro: <strong>Nombre del Logro</strong>."
            const match = achievementMessage.body.match(/<strong>(.*?)<\/strong>/);
            const achievementName = match ? match[1] : "Nuevo Logro";
            
            // TODO: Idealmente, el mensaje del buzón debería incluir el ID o icono del logro
            // para mostrarlo en el toast. Por ahora, usamos un icono genérico.
            // const achievementIcon = achievementMessage.data?.icon; // Si el backend lo enviara

            toast.success(<AchievementToast achievementName={achievementName} achievementIcon={null} />, {
              toastId: `ach-${achievementMessage._id}`, // Evita duplicados si se llama rápido
            });

            if (audioRef.current) {
              audioRef.current.play().catch(e => console.warn("Error al reproducir sonido de logro:", e));
            }
            
            addShownMessageId(achievementMessage._id);
            // Opcionalmente, marcar el mensaje como leído en el backend
            // await markMessageRead(achievementMessage._id, token); 
          }
        }
        lastCheckedTimestampRef.current = Date.now(); // Actualizar el timestamp de la última revisión
      } catch (error) {
        console.error("Error al verificar notificaciones de logros:", error);
      }
    };

    fetchAndNotify(); // Comprobar inmediatamente al cargar y si el usuario está logueado
    const intervalId = setInterval(fetchAndNotify, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [user]);

  return null; // Este componente no renderiza nada visible
}