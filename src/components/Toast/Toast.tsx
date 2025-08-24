import React from 'react';

export interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        backgroundColor: '#333',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 9999,
        maxWidth: 320,
      }}
      onClick={onClose}
    >
      {message}
    </div>
  );
};
