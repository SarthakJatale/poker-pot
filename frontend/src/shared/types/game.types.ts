import type { PlayerAction } from './player.types';

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
