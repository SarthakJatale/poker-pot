import { useState } from 'react';
import type { Room, Player, GameState } from '../types';

export interface AppState {
  room: Room | null;
  currentPlayer: Player | null;
  gameState: GameState | null;
  error: string | null;
}

const initialState: AppState = {
  room: null,
  currentPlayer: null,
  gameState: null,
  error: null,
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(initialState);

  const updateRoom = (room: Room | null) => {
    setState(prev => ({ ...prev, room }));
  };

  const updateCurrentPlayer = (player: Player | null) => {
    setState(prev => ({ ...prev, currentPlayer: player }));
  };

  const updateGameState = (gameState: GameState | null) => {
    setState(prev => ({ ...prev, gameState }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const reset = () => {
    setState(initialState);
  };

  return {
    ...state,
    updateRoom,
    updateCurrentPlayer,
    updateGameState,
    setError,
    clearError,
    reset,
  };
};
