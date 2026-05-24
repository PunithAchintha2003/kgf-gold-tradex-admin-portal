import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

export type ToastOptions = {
  description?: React.ReactNode;
  duration?: number;
};

type ToastDurationOrOptions = number | ToastOptions | undefined;

function resolveToastOptions(durationOrOptions?: ToastDurationOrOptions): ToastOptions {
  if (typeof durationOrOptions === 'number') {
    return { duration: durationOrOptions };
  }
  return durationOrOptions ?? {};
}

interface ToastContextType {
  showSuccess: (message: string, durationOrOptions?: ToastDurationOrOptions) => void;
  showError: (message: string, durationOrOptions?: ToastDurationOrOptions) => void;
  showWarning: (message: string, durationOrOptions?: ToastDurationOrOptions) => void;
  showInfo: (message: string, durationOrOptions?: ToastDurationOrOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showSuccess = useCallback((message: string, durationOrOptions?: ToastDurationOrOptions) => {
    toast.success(message, resolveToastOptions(durationOrOptions));
  }, []);

  const showError = useCallback((message: string, durationOrOptions?: ToastDurationOrOptions) => {
    toast.error(message, resolveToastOptions(durationOrOptions));
  }, []);

  const showWarning = useCallback((message: string, durationOrOptions?: ToastDurationOrOptions) => {
    toast.warning(message, resolveToastOptions(durationOrOptions));
  }, []);

  const showInfo = useCallback((message: string, durationOrOptions?: ToastDurationOrOptions) => {
    toast.info(message, resolveToastOptions(durationOrOptions));
  }, []);

  const value: ToastContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};
