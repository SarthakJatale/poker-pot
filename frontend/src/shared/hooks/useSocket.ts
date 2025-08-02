import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../services';
import type { SocketEventMap } from '../types';

export interface UseSocketReturn {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket<SocketEventMap, SocketEventMap> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const newSocket = socketService.connect();
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
};
