import React from 'react';
import { useToast } from '../hooks/useToast';
import type { Toast } from '../types/toast.types';

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getToastIcon()}
        </div>
        <div className="toast-body">
          <div className="toast-title">{toast.title}</div>
          {toast.message && (
            <div className="toast-message">{toast.message}</div>
          )}
        </div>
        {toast.action && (
          <button 
            className="toast-action"
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </button>
        )}
        {toast.dismissible && (
          <button 
            className="toast-close"
            onClick={() => onClose(toast.id)}
            aria-label="Close toast"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
