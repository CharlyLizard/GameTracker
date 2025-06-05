/**
 * Script para manejar la interacción del botón de verificación
 * Cierra la ventana si es un popup o redirige al usuario
 */
document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.getElementById('closeButton');
    
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        // Si estamos en un popup, lo cerramos
        if (window.opener && !window.opener.closed) {
          window.close();
        } else {
          // Si no estamos en un popup, redirigimos a la página de autenticación
          window.location.href = '/auth';
        }
      });
    }
  });