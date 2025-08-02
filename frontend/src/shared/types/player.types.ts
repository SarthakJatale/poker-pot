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

export interface PlayerAction {
  playerId: string;
  action: 'fold' | 'call' | 'raise' | 'check' | 'blind' | 'seen';
  amount?: number;
  timestamp: number;
}
