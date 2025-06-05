import React from "react";

const Notification = ({ message, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 20,
    right: 20,
    background: '#323232',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
  }}>
    {message}
    <button onClick={onClose} style={{
      marginLeft: 20,
      background: 'transparent',
      color: '#fff',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer'
    }}>X</button>
  </div>
);

export default Notification;