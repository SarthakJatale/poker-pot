import { useEffect, useState, useCallback, useRef } from 'react';
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
  const isInitialized = useRef(false);

  const connect = useCallback(() => {
    if (socketService.isConnected()) {
      // Reuse existing connection
      const existingSocket = socketService.getSocket();
      if (existingSocket) {
        setSocket(existingSocket);
        setIsConnected(true);
        return;
      }
    }

    const newSocket = socketService.connect();
    
    // Set socket immediately but track connection state separately
    setSocket(newSocket);
    setIsConnected(newSocket.connected);
    
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });
  }, []);

  const disconnect = useCallback(() => {
    console.log('Manual disconnect called');
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Only connect once when component first mounts
    if (!isInitialized.current) {
      connect();
      isInitialized.current = true;
    }

    // Don't disconnect on unmount - keep connection alive for navigation
    // Only disconnect when user explicitly leaves the app
    return () => {
      // Optional: Only disconnect if we're actually leaving the app
      // For now, keep connection alive during navigation
    };
  }, []); // Remove connect/disconnect from dependencies

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
};
