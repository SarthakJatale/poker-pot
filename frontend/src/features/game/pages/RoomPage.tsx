import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../shared/components';
import { useSocket, useAppState } from '../../../shared/hooks';
import { ROUTES } from '../../../app/routes';
import type { RouteParams } from '../../../app/routes';
import type { Room } from '../../../shared/types/room.types';
import type { Player } from '../../../shared/types/player.types';
import type { GameState } from '../../../shared/types/game.types';

// Lazy load the game room component
const GameRoom = React.lazy(() => import('../GameRoom'));

const RoomPage: React.FC = () => {
  const { roomId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const appState = useAppState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket || !roomId) {
      navigate(ROUTES.HOME);
      return;
    }

    const handleRoomUpdated = (room: Room) => {
      appState.updateRoom(room);
      if (appState.currentPlayer) {
        const updatedPlayer = room.players.find((p: Player) => p.id === socket.id) || appState.currentPlayer;
        appState.updateCurrentPlayer(updatedPlayer);
      }
      setIsLoading(false);
    };

    const handleGameStarted = (gameState: GameState) => {
      appState.updateGameState(gameState);
    };

    const handleGameUpdated = (gameState: GameState) => {
      appState.updateGameState(gameState);
    };

    const handlePlayerJoined = (player: Player) => {
      console.log('Player joined:', player.username);
    };

    const handlePlayerLeft = (playerId: string) => {
      console.log('Player left:', playerId);
    };

    const handleError = (message: string) => {
      appState.setError(message);
      // If room doesn't exist or other critical error, go back to home
      if (message.includes('Room not found') || message.includes('does not exist')) {
        navigate(ROUTES.HOME);
      }
    };

    // Set up socket listeners
    socket.on('room-updated', handleRoomUpdated);
    socket.on('game-started', handleGameStarted);
    socket.on('game-updated', handleGameUpdated);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('error', handleError);

    // If we don't have room data, it means user navigated directly to room URL
    // We need to handle this case appropriately
    if (!appState.room || appState.room.id !== roomId) {
      // Try to rejoin the room or redirect to home
      setIsLoading(false);
      navigate(ROUTES.HOME);
    } else {
      setIsLoading(false);
    }

    return () => {
      socket.off('room-updated', handleRoomUpdated);
      socket.off('game-started', handleGameStarted);
      socket.off('game-updated', handleGameUpdated);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('error', handleError);
    };
  }, [socket, roomId, navigate, appState]);

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    appState.reset();
    navigate(ROUTES.HOME);
  };

  if (isLoading) {
    return (
      <div className="room-page">
        <LoadingSpinner message="Loading room..." />
      </div>
    );
  }

  if (!appState.room || !appState.currentPlayer) {
    return (
      <div className="room-page">
        <div className="error-message">
          <h2>Room not found</h2>
          <p>The room you're looking for doesn't exist or you're not a member.</p>
          <button onClick={() => navigate(ROUTES.HOME)} className="primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page">
      <Suspense fallback={<LoadingSpinner message="Loading game room..." />}>
        <GameRoom
          socket={socket}
          room={appState.room}
          currentPlayer={appState.currentPlayer}
          gameState={appState.gameState}
          onLeaveRoom={handleLeaveRoom}
        />
      </Suspense>
    </div>
  );
};

export default RoomPage;
