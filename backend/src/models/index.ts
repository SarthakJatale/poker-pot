export interface Player {
  id: string;
  username: string;
  avatar: string;
  balance: number;
  isDealer: boolean;
  hasSeenCards: boolean;
  currentBet: number;
  hasFolded: boolean;
  isConnected: boolean;
}

export interface Room {
  id: string;
  hostId: string;
  players: Map<string, Player>;
  gameState: GameState;
  settings: RoomSettings;
}

export interface RoomSettings {
  initialBalance: number;
  initialBetAmount: number;
  maxPlayers: number;
}

export interface GameState {
  currentRound: number;
  currentTurn: number;
  pot: number;
  currentCallAmount: number;
  curretBlindAmount: number;
  dealerIndex: number;
  cardsOnTable: number; // 0, 3, 4, or 5 cards revealed
  roundPhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  isGameInProgress: boolean;
  lastAction?: PlayerAction;
  awaitingWinnerDeclaration?: boolean;
}

export interface PlayerAction {
  playerId: string;
  action: 'fold' | 'call' | 'raise' | 'check' | 'blind' | 'seen';
  amount?: number;
  timestamp: number;
}

export interface SerializedRoom {
  id: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  settings: RoomSettings;
}

// Socket Events Interface
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
  'room-created': (data: { roomId: string; room: SerializedRoom }) => void;
  'room-joined': (data: { room: SerializedRoom; playerId: string }) => void;
  'room-updated': (room: SerializedRoom) => void;
  'game-started': (gameState: GameState) => void;
  'game-updated': (gameState: GameState) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'balance-update-request': (data: { playerId: string; newBalance: number; requestedBy: string }) => void;
  'balance-updated': (data: { playerId: string; newBalance: number }) => void;
  'error': (message: string) => void;
  'toast': (toast: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string; duration?: number }) => void;
  'round-ended': (data: { winnerId?: string; pot: number }) => void;
}

export type SocketEventMap = {
  [K in keyof SocketEvents]: SocketEvents[K];
};
