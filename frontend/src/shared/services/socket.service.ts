import { io, Socket } from 'socket.io-client';
import type { SocketEventMap } from '../types';
import { SOCKET_URL } from '../constants';

class SocketService {
  private socket: Socket<SocketEventMap, SocketEventMap> | null = null;

  connect(): Socket<SocketEventMap, SocketEventMap> {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SOCKET_URL);
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket<SocketEventMap, SocketEventMap> | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
