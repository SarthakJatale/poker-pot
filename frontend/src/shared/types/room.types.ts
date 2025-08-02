import type { Player } from './player.types';
import type { GameState } from './game.types';

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  settings: RoomSettings;
}

export interface RoomSettings {
  initialBalance: number;
  initialBetAmount: number;
  maxPlayers: number;
}

export interface CreateRoomData {
  username: string;
  avatar: string;
  settings: RoomSettings;
}

export interface JoinRoomData {
  roomId: string;
  username: string;
  avatar: string;
}
