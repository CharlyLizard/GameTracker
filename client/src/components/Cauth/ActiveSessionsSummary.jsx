import React, { useEffect, useState } from "react";
import AuthService from "../../services/apis/AuthService";
import { getAuthData } from "../../services/storage/IndexedDbService";

const ActiveSessionsSummary = () => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getAuthData("token").then(token => {
      if (token) {
        AuthService.getActiveSessions(token).then(data => {
          setTotal((data.sesiones || []).length);
        });
      }
    });
  }, []);

  return (
    <span>
      <span className="font-semibold text-purple-400">Sesiones activas:</span> {total}
      <a href="/sessions" className="ml-2 text-xs text-purple-300 underline hover:text-pink-400">Ver detalles</a>
    </span>
  );
};

export default ActiveSessionsSummary;