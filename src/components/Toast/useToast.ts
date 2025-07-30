import React from 'react';

export interface ToastContextType {
  showToast: (
    message: string,
    type?: 'error' | 'warning' | 'success' | 'info',
    duration?: number
  ) => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
