import type { Room, RoomSettings } from './room.types';
import type { Player, PlayerAction } from './player.types';
import type { GameState } from './game.types';

export interface SocketEvents {
  // Client to Server
  'create-room': (data: { username: string; avatar: string; settings: RoomSettings }) => void;
  'join-room': (data: { roomId: string; username: string; avatar: string }) => void;
  'leave-room': () => void;
  'player-action': (action: Omit<PlayerAction, 'timestamp'>) => void;
  'start-game': () => void;
  'update-balance': (data: { playerId: string; newBalance: number }) => void;
  'update-settings': (settings: Partial<RoomSettings>) => void;
  // Host declares winner(s) after round ends
  'declare-winner': (winnerIds: string[], callback: (res: any) => void) => void;

  // Server to Client
  'room-created': (data: { roomId: string; room: Room }) => void;
  'room-joined': (data: { room: Room; playerId: string }) => void;
  'room-updated': (room: Room) => void;
  'game-started': (gameState: GameState) => void;
  'game-updated': (gameState: GameState) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'balance-update-request': (data: { playerId: string; newBalance: number; requestedBy: string }) => void;
  'balance-updated': (data: { playerId: string; newBalance: number }) => void;
  'error': (message: string) => void;
  'round-ended': (data: { winnerId?: string; pot: number }) => void;
}

export type SocketEventMap = {
  [K in keyof SocketEvents]: SocketEvents[K];
};
