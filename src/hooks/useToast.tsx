import { useState, useCallback } from 'react';
import type { ToastProps } from '../components/Toast/Toast';

export interface ToastData {
  id: string;
  message: string;
  type?: ToastProps['type'];
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastProps['type'] = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}; 