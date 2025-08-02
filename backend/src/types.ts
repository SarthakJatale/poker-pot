// Re-export from models for backward compatibility
export * from './models';

// Toast notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}
