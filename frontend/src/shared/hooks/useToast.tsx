import React, { createContext, useContext, useCallback, useRef } from 'react';
import type { Toast, ToastContextType, ToastOptions } from '../types/toast.types';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check for duplicate toasts (same type and title)
    const isDuplicate = toasts.some(
      toast => toast.type === toastData.type && toast.title === toastData.title
    );
    
    if (isDuplicate) {
      return id; // Don't add duplicate toast
    }

    const newToast: Toast = {
      id,
      dismissible: true,
      duration: 5000, // Default 5 seconds
      ...toastData,
    };

    setToasts(prev => {
      const updated = [...prev, newToast];
      // Limit number of toasts
      if (updated.length > maxToasts) {
        const removedToast = updated.shift();
        if (removedToast) {
          const timeoutId = timeoutRefs.current.get(removedToast.id);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutRefs.current.delete(removedToast.id);
          }
        }
      }
      return updated;
    });

    // Auto-dismiss if duration is set
    if (newToast.duration && newToast.duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
      
      timeoutRefs.current.set(id, timeoutId);
    }

    return id;
  }, [toasts, maxToasts, removeToast]);

  const clearToasts = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, []);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    updateToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience hooks for different toast types
export const useToastActions = () => {
  const { addToast } = useToast();

  const showSuccess = useCallback((title: string, message?: string, options?: ToastOptions) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, options?: ToastOptions) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 0, // Errors don't auto-dismiss by default
      ...options,
    });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, options?: ToastOptions) => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 7000, // Warnings stay longer
      ...options,
    });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, options?: ToastOptions) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addToast]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
