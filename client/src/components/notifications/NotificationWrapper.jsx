import React, { useEffect, useState } from "react";
import Notification from "./Notification";

const DURATION = 4000; // ms

const NotificationWrapper = () => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.sessionStorage.getItem("showVerifyNotification") === "true") {
      setShow(true);
      window.sessionStorage.removeItem("showVerifyNotification");
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    setProgress(0);
    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
      if (elapsed >= DURATION) {
        setShow(false);
        clearInterval(timer);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [show]);

  if (!show) return null;

  return (
    <div style={{ position: "relative" }}>
      <Notification
        message="¡Revisa tu correo para verificar tu cuenta antes de iniciar sesión!"
        onClose={() => setShow(false)}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "4px",
          width: `${progress}%`,
          background: "linear-gradient(to right, #8b5cf6, #ec4899)",
          borderRadius: "0 0 1rem 1rem",
          transition: "width 50ms linear",
        }}
      />
    </div>
  );
};

export default NotificationWrapper;