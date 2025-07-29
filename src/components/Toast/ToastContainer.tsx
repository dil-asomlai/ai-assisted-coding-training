import React from 'react';
import { Toast } from './Toast';
import type { ToastData } from '../../hooks/useToast';

export interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            top: 20 + index * 80,
            right: 20,
            zIndex: 1000 + index,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemoveToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}; 