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
    minBetAmount: number;
    dealerIndex: number;
    cardsOnTable: number;
    roundPhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
    isGameInProgress: boolean;
    lastAction?: PlayerAction;
}
export interface PlayerAction {
    playerId: string;
    action: 'fold' | 'call' | 'raise' | 'check' | 'blind' | 'seen';
    amount?: number;
    timestamp: number;
}
export interface SocketEvents {
    'create-room': (data: {
        username: string;
        avatar: string;
        settings: RoomSettings;
    }) => void;
    'join-room': (data: {
        roomId: string;
        username: string;
        avatar: string;
    }) => void;
    'leave-room': () => void;
    'player-action': (action: Omit<PlayerAction, 'timestamp'>) => void;
    'start-game': () => void;
    'update-balance': (data: {
        playerId: string;
        newBalance: number;
    }) => void;
    'update-settings': (settings: Partial<RoomSettings>) => void;
    'room-created': (data: {
        roomId: string;
        room: Room;
    }) => void;
    'room-joined': (data: {
        room: Room;
        playerId: string;
    }) => void;
    'room-updated': (room: Room) => void;
    'game-started': (gameState: GameState) => void;
    'game-updated': (gameState: GameState) => void;
    'player-joined': (player: Player) => void;
    'player-left': (playerId: string) => void;
    'balance-update-request': (data: {
        playerId: string;
        newBalance: number;
        requestedBy: string;
    }) => void;
    'balance-updated': (data: {
        playerId: string;
        newBalance: number;
    }) => void;
    'error': (message: string) => void;
    'round-ended': (data: {
        winnerId?: string;
        pot: number;
    }) => void;
}
export type SocketEventMap = {
    [K in keyof SocketEvents]: SocketEvents[K];
};
//# sourceMappingURL=types.d.ts.map