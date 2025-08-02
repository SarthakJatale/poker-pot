import { useEffect } from 'react';
import { AppRouter } from './app';
import { ErrorBoundary } from './shared/components';
import { useSocket, useAppState } from './shared/hooks';
import type { Player } from './shared/types/player.types';
import type { Room } from './shared/types/room.types';
import './App.css';

function App() {
  const { socket } = useSocket();
  const appState = useAppState();

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Connected to server');
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      appState.setError('Connection lost. Please refresh the page.');
    };

    const handleError = (message: string) => {
      appState.setError(message);
    };

    const handleRoomCreated = (data: { roomId: string; room: Room }) => {
      appState.updateRoom(data.room);
      const currentPlayer = data.room.players.find((p: Player) => p.id === socket.id) || null;
      appState.updateCurrentPlayer(currentPlayer);
      appState.setError(null);
    };

    const handleRoomJoined = (data: { room: Room; playerId: string }) => {
      appState.updateRoom(data.room);
      const currentPlayer = data.room.players.find((p: Player) => p.id === data.playerId) || null;
      appState.updateCurrentPlayer(currentPlayer);
      appState.setError(null);
    };

    // Set up socket listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);
    socket.on('room-created', handleRoomCreated);
    socket.on('room-joined', handleRoomJoined);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
      socket.off('room-created', handleRoomCreated);
      socket.off('room-joined', handleRoomJoined);
    };
  }, [socket, appState]);

  return (
    <ErrorBoundary>
      <div className="app">
        {appState.error && (
          <div className="error-banner">
            <span>{appState.error}</span>
            <button onClick={appState.clearError}>×</button>
          </div>
        )}
        
        <AppRouter />
      </div>
    </ErrorBoundary>
  );
}

export default App;
