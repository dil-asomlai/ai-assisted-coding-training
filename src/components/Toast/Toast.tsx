import React, { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

export interface ToastProps {
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  open: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  severity = 'error',
  open,
  onClose,
  autoHideDuration = 6000,
}) => {
  useEffect(() => {
    if (open && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};
