import { useEffect } from 'react';
import { useToastActions } from './useToast';
import type { Socket } from 'socket.io-client';
import type { SocketEventMap } from '../types/socket.types';

export const useSocketToasts = (socket: Socket<SocketEventMap, SocketEventMap> | null) => {
  const { showSuccess, showError, showWarning, showInfo } = useToastActions();

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      showSuccess('Connected', 'Successfully connected to server');
    };

    const handleDisconnect = () => {
      showError('Disconnected', 'Lost connection to server. Please refresh the page.', {
        duration: 0 // Don't auto-dismiss
      });
    };

    const handleRoomCreated = () => {
      showSuccess('Room Created', 'Room created successfully! Share the room ID with your friends.');
    };

    const handleRoomJoined = (data: { room: any; playerId: string }) => {
      const playerCount = data.room.players?.length || 0;
      showSuccess('Joined Room', `Successfully joined room. ${playerCount} players in room.`);
    };

    const handlePlayerJoined = (player: any) => {
      showInfo('Player Joined', `${player.username} joined the room`);
    };

    const handlePlayerLeft = (_playerId: string) => {
      showWarning('Player Left', 'A player has left the room');
    };

    const handleGameStarted = () => {
      showSuccess('Game Started', 'The game has begun! Good luck!');
    };

    const handleBalanceUpdated = (data: { playerId: string; newBalance: number }) => {
      if (data.playerId === socket.id) {
        showInfo('Balance Updated', `Your balance has been updated to $${data.newBalance}`);
      }
    };

    const handleRoundEnded = (data: { winnerId?: string; pot: number }) => {
      if (data.winnerId === socket.id) {
        showSuccess('You Won!', `Congratulations! You won $${data.pot}`);
      } else if (data.winnerId) {
        showInfo('Round Ended', `Round ended. Pot: $${data.pot}`);
      } else {
        showInfo('Round Ended', 'Round ended without a winner');
      }
    };

    // Attach listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('game-started', handleGameStarted);
    socket.on('balance-updated', handleBalanceUpdated);
    socket.on('round-ended', handleRoundEnded);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('game-started', handleGameStarted);
      socket.off('balance-updated', handleBalanceUpdated);
      socket.off('round-ended', handleRoundEnded);
    };
  }, [socket, showSuccess, showError, showWarning, showInfo]);
};
