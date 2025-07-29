import React, { useEffect, useState } from 'react';
import './Toast.css';

export interface ToastProps {
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`toast toast--${type}`} role="alert">
      <div className="toast__content">
        <span className="toast__message">{message}</span>
        <button
          className="toast__close"
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}; 