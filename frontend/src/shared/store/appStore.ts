import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Room, Player, GameState } from '../types';

interface AppState {
  room: Room | null;
  currentPlayer: Player | null;
  gameState: GameState | null;
  error: string | null;
}

interface AppActions {
  updateRoom: (room: Room | null) => void;
  updateCurrentPlayer: (player: Player | null) => void;
  updateGameState: (gameState: GameState | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  room: null,
  currentPlayer: null,
  gameState: null,
  error: null,
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      updateRoom: (room: Room | null) => set({ room }, false, 'updateRoom'),
      
      updateCurrentPlayer: (currentPlayer: Player | null) => 
        set({ currentPlayer }, false, 'updateCurrentPlayer'),
      
      updateGameState: (gameState: GameState | null) => 
        set({ gameState }, false, 'updateGameState'),
      
      setError: (error: string | null) => set({ error }, false, 'setError'),
      
      clearError: () => set({ error: null }, false, 'clearError'),
      
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'poker-app-store', // for Redux DevTools
    }
  )
);
