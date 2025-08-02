import { Socket } from 'socket.io';
import { ToastType } from '../types';

interface ToastMessage {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export class ToastResponseHandler {
  constructor(
    private socket: Socket,
    private io: any // Socket.IO server instance
  ) {}

  /**
   * Send a success toast to the current socket
   */
  sendSuccess(title: string, message: string, duration?: number): void {
    this.sendToast('success', title, message, duration);
  }

  /**
   * Send an error toast to the current socket
   */
  sendError(title: string, message: string, duration?: number): void {
    this.sendToast('error', title, message, duration);
  }

  /**
   * Send an info toast to the current socket
   */
  sendInfo(title: string, message: string, duration?: number): void {
    this.sendToast('info', title, message, duration);
  }

  /**
   * Send a warning toast to the current socket
   */
  sendWarning(title: string, message: string, duration?: number): void {
    this.sendToast('warning', title, message, duration);
  }

  /**
   * Send a success toast to all players in a room
   */
  sendSuccessToRoom(roomId: string, title: string, message: string, duration?: number): void {
    this.sendToastToRoom(roomId, 'success', title, message, duration);
  }

  /**
   * Send an error toast to all players in a room
   */
  sendErrorToRoom(roomId: string, title: string, message: string, duration?: number): void {
    this.sendToastToRoom(roomId, 'error', title, message, duration);
  }

  /**
   * Send an info toast to all players in a room
   */
  sendInfoToRoom(roomId: string, title: string, message: string, duration?: number): void {
    this.sendToastToRoom(roomId, 'info', title, message, duration);
  }

  /**
   * Send a warning toast to all players in a room
   */
  sendWarningToRoom(roomId: string, title: string, message: string, duration?: number): void {
    this.sendToastToRoom(roomId, 'warning', title, message, duration);
  }

  /**
   * Send a toast to a specific player by their socket ID
   */
  sendToastToPlayer(playerId: string, type: ToastType, title: string, message: string, duration?: number): void {
    const toastData: ToastMessage = {
      type,
      title,
      message,
      duration
    };

    this.io.to(playerId).emit('toast', toastData);
  }

  /**
   * Send an info toast to a specific player
   */
  sendInfoToPlayer(playerId: string, title: string, message: string, duration?: number): void {
    this.sendToastToPlayer(playerId, 'info', title, message, duration);
  }

  /**
   * Send a success toast to a specific player
   */
  sendSuccessToPlayer(playerId: string, title: string, message: string, duration?: number): void {
    this.sendToastToPlayer(playerId, 'success', title, message, duration);
  }

  /**
   * Send an error toast to a specific player
   */
  sendErrorToPlayer(playerId: string, title: string, message: string, duration?: number): void {
    this.sendToastToPlayer(playerId, 'error', title, message, duration);
  }

  /**
   * Send a warning toast to a specific player
   */
  sendWarningToPlayer(playerId: string, title: string, message: string, duration?: number): void {
    this.sendToastToPlayer(playerId, 'warning', title, message, duration);
  }

  /**
   * Private method to send toast to current socket
   */
  private sendToast(type: ToastType, title: string, message: string, duration?: number): void {
    const toastData: ToastMessage = {
      type,
      title,
      message,
      duration
    };

    this.socket.emit('toast', toastData);
  }

  /**
   * Private method to send toast to all players in a room
   */
  private sendToastToRoom(roomId: string, type: ToastType, title: string, message: string, duration?: number): void {
    const toastData: ToastMessage = {
      type,
      title,
      message,
      duration
    };

    this.io.to(roomId).emit('toast', toastData);
  }
}
