import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import HomePage from './components/HomePage';
import GameRoom from './components/GameRoom';
import type { Room, Player, GameState, SocketEventMap } from './types';
import './App.css';

const SOCKET_URL = 'http://localhost:3001';

interface AppState {
  currentView: 'home' | 'room';
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  room: Room | null;
  currentPlayer: Player | null;
  gameState: GameState | null;
  error: string | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'home',
    socket: null,
    room: null,
    currentPlayer: null,
    gameState: null,
    error: null,
  });

  useEffect(() => {
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('error', (message: string) => {
      setState(prev => ({ ...prev, error: message }));
    });

    socket.on('room-created', (data) => {
      setState(prev => ({
        ...prev,
        currentView: 'room',
        room: data.room,
        currentPlayer: data.room.players.find((p: Player) => p.id === socket.id) || null,
        error: null,
      }));
    });

    socket.on('room-joined', (data) => {
      setState(prev => ({
        ...prev,
        currentView: 'room',
        room: data.room,
        currentPlayer: data.room.players.find((p: Player) => p.id === data.playerId) || null,
        error: null,
      }));
    });

    socket.on('room-updated', (room) => {
      setState(prev => ({
        ...prev,
        room,
        currentPlayer: room.players.find((p: Player) => p.id === socket.id) || prev.currentPlayer,
      }));
    });

    socket.on('game-started', (gameState) => {
      setState(prev => ({ ...prev, gameState }));
    });

    socket.on('game-updated', (gameState) => {
      setState(prev => ({ ...prev, gameState }));
    });

    socket.on('player-joined', (player) => {
      console.log('Player joined:', player.username);
    });

    socket.on('player-left', (playerId) => {
      console.log('Player left:', playerId);
    });

    setState(prev => ({ ...prev, socket }));

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const goHome = () => {
    if (state.socket) {
      state.socket.emit('leave-room');
    }
    setState(prev => ({
      ...prev,
      currentView: 'home',
      room: null,
      currentPlayer: null,
      gameState: null,
      error: null,
    }));
  };

  return (
    <div className="app">
      {state.error && (
        <div className="error-banner">
          <span>{state.error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}
      
      {state.currentView === 'home' && (
        <HomePage socket={state.socket} />
      )}
      
      {state.currentView === 'room' && state.room && state.currentPlayer && (
        <GameRoom
          socket={state.socket}
          room={state.room}
          currentPlayer={state.currentPlayer}
          gameState={state.gameState}
          onLeaveRoom={goHome}
        />
      )}
    </div>
  );
}

export default App;
