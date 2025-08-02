import React, { Suspense, useEffect } from 'react';
import { AppRouter } from './app';
import { LoadingSpinner, ErrorBoundary } from './shared/components';
import { useSocket, useAppState } from './shared/hooks';
import type { Player } from './shared/types/player.types';
import type { Room } from './shared/types/room.types';
import type { GameState } from './shared/types/game.types';
import './App.css';

// Lazy load features for code splitting
const HomePage = React.lazy(() => import('./features/home/HomePage'));
const GameRoom = React.lazy(() => import('./features/game/GameRoom'));

interface AppState {
  currentView: 'home' | 'room';
}

function App() {
  const { socket } = useSocket();
  const appState = useAppState();
  const [currentView, setCurrentView] = React.useState<AppState['currentView']>('home');

  useEffect(() => {
    if (!socket) return;

    socket.on('error', (message: string) => {
      appState.setError(message);
    });

    socket.on('room-created', (data: { roomId: string; room: Room }) => {
      setCurrentView('room');
      appState.updateRoom(data.room);
      const currentPlayer = data.room.players.find((p: Player) => p.id === socket.id) || null;
      appState.updateCurrentPlayer(currentPlayer);
      appState.setError(null);
    });

    socket.on('room-joined', (data: { room: Room; playerId: string }) => {
      setCurrentView('room');
      appState.updateRoom(data.room);
      const currentPlayer = data.room.players.find((p: Player) => p.id === data.playerId) || null;
      appState.updateCurrentPlayer(currentPlayer);
      appState.setError(null);
    });

    socket.on('room-updated', (room: Room) => {
      appState.updateRoom(room);
      if (appState.currentPlayer) {
        const updatedPlayer = room.players.find((p: Player) => p.id === socket.id) || appState.currentPlayer;
        appState.updateCurrentPlayer(updatedPlayer);
      }
    });

    socket.on('game-started', (gameState: GameState) => {
      appState.updateGameState(gameState);
    });

    socket.on('game-updated', (gameState: GameState) => {
      appState.updateGameState(gameState);
    });

    socket.on('player-joined', (player: Player) => {
      console.log('Player joined:', player.username);
    });

    socket.on('player-left', (playerId: string) => {
      console.log('Player left:', playerId);
    });

    return () => {
      socket.off('error');
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('room-updated');
      socket.off('game-started');
      socket.off('game-updated');
      socket.off('player-joined');
      socket.off('player-left');
    };
  }, [socket, appState]);

  const goHome = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    setCurrentView('home');
    appState.reset();
  };

  return (
    <AppRouter>
      <ErrorBoundary>
        <div className="app">
          {appState.error && (
            <div className="error-banner">
              <span>{appState.error}</span>
              <button onClick={appState.clearError}>×</button>
            </div>
          )}
          
          <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
            {currentView === 'home' && (
              <HomePage socket={socket} />
            )}
            
            {currentView === 'room' && appState.room && appState.currentPlayer && (
              <GameRoom
                socket={socket}
                room={appState.room}
                currentPlayer={appState.currentPlayer}
                gameState={appState.gameState}
                onLeaveRoom={goHome}
              />
            )}
          </Suspense>
        </div>
      </ErrorBoundary>
    </AppRouter>
  );
}

export default App;
