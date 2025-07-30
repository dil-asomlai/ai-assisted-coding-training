import React, { useState, useCallback } from 'react';
import Toast from './Toast';
import type { ToastMessage } from './Toast';
import { v4 as uuidv4 } from 'uuid';
import { ToastContext } from './useToast';

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: 'error' | 'warning' | 'success' | 'info' = 'info',
      duration?: number
    ) => {
      const newToast: ToastMessage = {
        id: uuidv4(),
        message,
        type,
        duration,
      };
      setToasts(prev => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
