import { Player, Room, GameState, PlayerAction, RoomSettings } from './types';

export class GameLogic {
  
  static createInitialGameState(initialBetAmount: number): GameState {
    return {
      currentRound: 1,
      currentTurn: 0,
      pot: 0,
      minBetAmount: initialBetAmount,
      dealerIndex: 0,
      cardsOnTable: 0,
      roundPhase: 'preflop',
      isGameInProgress: false,
    };
  }

  static startGame(room: Room): GameState {
    const players = Array.from(room.players.values()).filter(p => p.isConnected);
    
    if (players.length < 2) {
      throw new Error('Need at least 2 players to start the game');
    }

    // Set first player as dealer
    players[0].isDealer = true;
    room.gameState.dealerIndex = 0;
    room.gameState.isGameInProgress = true;
    room.gameState.currentTurn = 0;
    room.gameState.roundPhase = 'preflop';
    room.gameState.cardsOnTable = 0;

    // Reset all players
    players.forEach(player => {
      player.currentBet = 0;
      player.hasFolded = false;
      player.hasSeenCards = false;
    });

    // Small blind (dealer)
    const dealer = players[room.gameState.dealerIndex];
    dealer.currentBet = room.settings.initialBetAmount;
    dealer.balance -= room.settings.initialBetAmount;
    room.gameState.pot += room.settings.initialBetAmount;

    // Big blind (next player)
    const bigBlindIndex = (room.gameState.dealerIndex + 1) % players.length;
    const bigBlindPlayer = players[bigBlindIndex];
    bigBlindPlayer.currentBet = room.settings.initialBetAmount * 2;
    bigBlindPlayer.balance -= room.settings.initialBetAmount * 2;
    bigBlindPlayer.hasSeenCards = true; // Big blind must see cards
    room.gameState.pot += room.settings.initialBetAmount * 2;

    // Set turn to player after big blind
    room.gameState.currentTurn = (bigBlindIndex + 1) % players.length;
    
    return room.gameState;
  }

  static processPlayerAction(room: Room, action: PlayerAction): { gameState: GameState; error?: string } {
    const players = Array.from(room.players.values()).filter(p => p.isConnected && !p.hasFolded);
    const currentPlayer = room.players.get(action.playerId);

    if (!currentPlayer) {
      return { gameState: room.gameState, error: 'Player not found' };
    }

    if (currentPlayer.hasFolded) {
      return { gameState: room.gameState, error: 'Player has already folded' };
    }

    const currentTurnPlayer = players[room.gameState.currentTurn];
    if (currentPlayer.id !== currentTurnPlayer?.id) {
      return { gameState: room.gameState, error: 'Not your turn' };
    }

    switch (action.action) {
      case 'fold':
        currentPlayer.hasFolded = true;
        break;

      case 'seen':
        if (currentPlayer.hasSeenCards) {
          return { gameState: room.gameState, error: 'Already seen cards' };
        }
        const seenAmount = room.gameState.minBetAmount * 2;
        if (currentPlayer.balance < seenAmount) {
          return { gameState: room.gameState, error: 'Insufficient balance' };
        }
        currentPlayer.hasSeenCards = true;
        currentPlayer.currentBet += seenAmount;
        currentPlayer.balance -= seenAmount;
        room.gameState.pot += seenAmount;
        break;

      case 'blind':
        if (currentPlayer.hasSeenCards) {
          return { gameState: room.gameState, error: 'Cannot play blind after seeing cards' };
        }
        const blindAmount = room.gameState.minBetAmount;
        if (currentPlayer.balance < blindAmount) {
          return { gameState: room.gameState, error: 'Insufficient balance' };
        }
        currentPlayer.currentBet += blindAmount;
        currentPlayer.balance -= blindAmount;
        room.gameState.pot += blindAmount;
        break;

      case 'raise':
        if (!action.amount || action.amount <= 0) {
          return { gameState: room.gameState, error: 'Invalid raise amount' };
        }
        const raiseAmount = action.amount * room.settings.initialBetAmount;
        if (currentPlayer.balance < raiseAmount) {
          return { gameState: room.gameState, error: 'Insufficient balance for raise' };
        }
        currentPlayer.currentBet += raiseAmount;
        currentPlayer.balance -= raiseAmount;
        room.gameState.pot += raiseAmount;
        room.gameState.minBetAmount = raiseAmount;
        break;

      case 'check':
        // Check is only valid if no one has raised this round
        const maxBet = Math.max(...players.map(p => p.currentBet));
        if (currentPlayer.currentBet < maxBet) {
          return { gameState: room.gameState, error: 'Cannot check, must call or fold' };
        }
        break;

      default:
        return { gameState: room.gameState, error: 'Invalid action' };
    }

    room.gameState.lastAction = { ...action, timestamp: Date.now() };

    // Move to next player
    room.gameState.currentTurn = (room.gameState.currentTurn + 1) % players.length;

    // Check if round is complete
    const activePlayers = players.filter(p => !p.hasFolded);
    if (activePlayers.length === 1) {
      // Only one player left, they win
      return this.endRound(room, activePlayers[0].id);
    }

    // Check if all players have acted in this betting round
    const allPlayersActed = this.checkIfBettingRoundComplete(room);
    if (allPlayersActed) {
      return this.advanceToNextPhase(room);
    }

    return { gameState: room.gameState };
  }

  private static checkIfBettingRoundComplete(room: Room): boolean {
    const players = Array.from(room.players.values()).filter(p => p.isConnected && !p.hasFolded);
    const maxBet = Math.max(...players.map(p => p.currentBet));
    
    // All players must have either folded or matched the max bet
    return players.every(p => p.hasFolded || p.currentBet === maxBet);
  }

  private static advanceToNextPhase(room: Room): { gameState: GameState; error?: string } {
    switch (room.gameState.roundPhase) {
      case 'preflop':
        room.gameState.roundPhase = 'flop';
        room.gameState.cardsOnTable = 3;
        break;
      case 'flop':
        room.gameState.roundPhase = 'turn';
        room.gameState.cardsOnTable = 4;
        break;
      case 'turn':
        room.gameState.roundPhase = 'river';
        room.gameState.cardsOnTable = 5;
        break;
      case 'river':
        room.gameState.roundPhase = 'showdown';
        // In a real poker game, this would determine the winner
        // For this pot calculator, we'll just end the round
        return this.endRound(room);
      default:
        return { gameState: room.gameState, error: 'Invalid game phase' };
    }

    // Reset current bets for new betting round
    Array.from(room.players.values()).forEach(player => {
      player.currentBet = 0;
    });

    // Reset turn to dealer
    room.gameState.currentTurn = room.gameState.dealerIndex;
    room.gameState.minBetAmount = room.settings.initialBetAmount;

    return { gameState: room.gameState };
  }

  private static endRound(room: Room, winnerId?: string): { gameState: GameState; error?: string } {
    const players = Array.from(room.players.values()).filter(p => p.isConnected);
    
    if (winnerId) {
      const winner = room.players.get(winnerId);
      if (winner) {
        winner.balance += room.gameState.pot;
      }
    } else {
      // Split pot among remaining players (simplified)
      const activePlayers = players.filter(p => !p.hasFolded);
      const splitAmount = Math.floor(room.gameState.pot / activePlayers.length);
      activePlayers.forEach(player => {
        player.balance += splitAmount;
      });
    }

    // Move dealer to next player
    room.gameState.dealerIndex = (room.gameState.dealerIndex + 1) % players.length;
    
    // Reset game state for next round
    players.forEach(player => {
      player.isDealer = false;
      player.currentBet = 0;
      player.hasFolded = false;
      player.hasSeenCards = false;
    });

    // Set new dealer
    players[room.gameState.dealerIndex].isDealer = true;

    room.gameState.currentRound += 1;
    room.gameState.pot = 0;
    room.gameState.cardsOnTable = 0;
    room.gameState.roundPhase = 'preflop';
    room.gameState.minBetAmount = room.settings.initialBetAmount;
    room.gameState.currentTurn = room.gameState.dealerIndex;
    room.gameState.lastAction = undefined;

    return { gameState: room.gameState };
  }

  static updatePlayerBalance(room: Room, playerId: string, newBalance: number): boolean {
    const player = room.players.get(playerId);
    if (!player) return false;

    player.balance = newBalance;
    return true;
  }

  static updateRoomSettings(room: Room, settings: Partial<RoomSettings>): void {
    if (room.gameState.isGameInProgress) {
      throw new Error('Cannot update settings during an active game');
    }

    Object.assign(room.settings, settings);
  }
}
