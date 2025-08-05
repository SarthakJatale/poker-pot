import { useEffect } from 'react';
import { AppRouter } from './app/providers';
import { ErrorBoundary, ToastContainer } from './shared/components';
import { ToastProvider, useSocket } from './shared/hooks';
import { useAppStore } from './shared/store/appStore';
import type { Player } from './shared/types/player.types';
import type { Room } from './shared/types/room.types';
import './App.css';

function App() {
  const { socket } = useSocket();
  const { error, updateRoom, updateCurrentPlayer, setError, clearError } = useAppStore();

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Connected to server');
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setError('Connection lost. Please refresh the page.');
    };

    const handleError = (message: string) => {
      setError(message);
    };

    const handleRoomCreated = (data: { roomId: string; room: Room }) => {
      updateRoom(data.room);
      const currentPlayer = data.room.players.find((p: Player) => p.id === socket.id) || null;
      updateCurrentPlayer(currentPlayer);
      setError(null);
    };

    const handleRoomJoined = (data: { room: Room; playerId: string }) => {
      updateRoom(data.room);
      const currentPlayer = data.room.players.find((p: Player) => p.id === data.playerId) || null;
      updateCurrentPlayer(currentPlayer);
      setError(null);
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
  }, [socket]);

  return (
    <ErrorBoundary>
      <ToastProvider maxToasts={4}>
        <div className="app">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={clearError}>×</button>
            </div>
          )}
          
          <AppRouter />
          <ToastContainer />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
