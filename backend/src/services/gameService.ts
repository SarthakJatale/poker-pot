import { Player, Room, GameState, PlayerAction, RoomSettings } from '../models';
import { Logger } from '../utils';
import { ValidationError } from '../validators';

export class GameService {
  
  static createInitialGameState(initialBetAmount: number): GameState {
    return {
      currentRound: 1,
      currentTurn: 0,
      pot: 0,
      curretBlindAmount: initialBetAmount,
      currentCallAmount: initialBetAmount * 2, // Big blind amount
      dealerIndex: 0,
      cardsOnTable: 0,
      roundPhase: 'preflop',
      isGameInProgress: false,
    };
  }

  /**
   * Start a new poker game following standard Texas Hold'em rules
   * Supports 2-8 players with proper dealer button rotation
   */
  static startGame(room: Room): GameState {
    try {
      const players = Array.from(room.players.values()).filter(p => p.isConnected);
      
      if (players.length < 2) {
        throw new ValidationError('Need at least 2 players to start the game');
      }

      if (players.length > 8) {
        throw new ValidationError('Maximum 8 players allowed');
      }

      // Reset all players for new hand
      this.resetPlayersForNewHand(players);
      
      // Set dealer position (rotates each hand)
      const dealerIndex = room.gameState.dealerIndex;
      players[dealerIndex].isDealer = true;
      
      // Initialize game state
      room.gameState.isGameInProgress = true;
      room.gameState.roundPhase = 'preflop';
      room.gameState.cardsOnTable = 0;
      room.gameState.pot = 0;

      // Post blinds according to Texas Hold'em rules
      this.postBlinds(room, players);

      // Set first player to act (left of big blind for preflop)
      const firstToActIndex = this.getFirstToActPreflop(players.length, dealerIndex);
      room.gameState.currentTurn = firstToActIndex;

      Logger.info(`🃏 Poker game started`, { 
        roomId: room.id,
        playersCount: players.length,
        dealerIndex,
        firstToAct: firstToActIndex,
        pot: room.gameState.pot 
      });
      
      return room.gameState;
    } catch (error) {
      Logger.error('Failed to start game', error);
      throw error;
    }
  }

  /**
   * Reset all players for a new hand
   */
  private static resetPlayersForNewHand(players: Player[]): void {
    players.forEach(player => {
      player.currentBet = 0;
      player.hasFolded = false;
      player.hasSeenCards = false;
      player.isDealer = false; // Will be set for the correct player
    });
  }

  /**
   * Post small and big blinds according to Texas Hold'em rules
   */
  private static postBlinds(room: Room, players: Player[]): void {
    const dealerIndex = room.gameState.dealerIndex;
    const smallBlindAmount = room.settings.initialBetAmount;
    const bigBlindAmount = smallBlindAmount * 2;

    if (players.length === 2) {
      // Heads-up: Dealer is small blind, other player is big blind
      const smallBlindIndex = dealerIndex;
      const bigBlindIndex = (dealerIndex + 1) % players.length;
      
      this.postBlind(players[smallBlindIndex], smallBlindAmount, room, 'small');
      this.postBlind(players[bigBlindIndex], bigBlindAmount, room, 'big');
    } else {
      // 3+ players: Player left of dealer is small blind, next is big blind
      const smallBlindIndex = (dealerIndex + 1) % players.length;
      const bigBlindIndex = (dealerIndex + 2) % players.length;
      
      this.postBlind(players[smallBlindIndex], smallBlindAmount, room, 'small');
      this.postBlind(players[bigBlindIndex], bigBlindAmount, room, 'big');
    }

    room.gameState.curretBlindAmount = smallBlindAmount;
    room.gameState.currentCallAmount = bigBlindAmount;
  }

  /**
   * Post a blind for a player
   */
  private static postBlind(player: Player, amount: number, room: Room, blindType: 'small' | 'big'): void {
    if (player.balance < amount) {
      // All-in for less than blind amount
      const allInAmount = player.balance;
      player.currentBet = allInAmount;
      player.balance = 0;
      room.gameState.pot += allInAmount;
      Logger.info(`${blindType} blind all-in`, { playerId: player.id, amount: allInAmount });
    } else {
      player.currentBet = amount;
      player.balance -= amount;
      room.gameState.pot += amount;
      Logger.info(`${blindType} blind posted`, { playerId: player.id, amount });
    }

    // Big blind player has "seen" cards (forced to act)
    if (blindType === 'big') {
      player.hasSeenCards = true;
    }
  }

  /**
   * Get the first player to act preflop (left of big blind - UTG position)
   */
  private static getFirstToActPreflop(playerCount: number, dealerIndex: number): number {
    if (playerCount === 2) {
      // Heads-up: Small blind (dealer) acts first preflop
      return dealerIndex;
    } else {
      // 3+ players: First player left of big blind (Under The Gun)
      return (dealerIndex + 3) % playerCount;
    }
  }

  /**
   * Get the first player to act post-flop (left of dealer, still in hand)
   */
  private static getFirstToActPostflop(players: Player[], dealerIndex: number): number {
    const activePlayers = players.filter(p => p.isConnected && !p.hasFolded);
    let firstToAct = (dealerIndex + 1) % players.length;
    
    // Find first active player left of dealer
    while (!activePlayers.find(p => p.id === players[firstToAct].id)) {
      firstToAct = (firstToAct + 1) % players.length;
    }
    
    return firstToAct;
  }

  /**
   * Process a player action following Texas Hold'em betting rules
   */
  static processPlayerAction(room: Room, action: PlayerAction): { gameState: GameState; error?: string } {
    try {
      const players = Array.from(room.players.values()).filter(p => p.isConnected);
      const activePlayers = players.filter(p => !p.hasFolded);
      const currentPlayer = room.players.get(action.playerId);

      if (!currentPlayer) {
        return { gameState: room.gameState, error: 'Player not found' };
      }

      if (currentPlayer.hasFolded) {
        return { gameState: room.gameState, error: 'Player has already folded' };
      }

      // Verify it's the player's turn
      const currentTurnPlayer = activePlayers[room.gameState.currentTurn];
      if (!currentTurnPlayer || currentPlayer.id !== currentTurnPlayer.id) {
        return { gameState: room.gameState, error: 'Not your turn' };
      }

      // Process the action
      const actionResult = this.executePlayerAction(room, currentPlayer, action);
      if (actionResult.error) {
        return { gameState: room.gameState, error: actionResult.error };
      }

      // Update last action
      room.gameState.lastAction = { ...action, timestamp: Date.now() };

      // Check if only one player remains (winner by fold)
      const remainingPlayers = activePlayers.filter(p => !p.hasFolded);
      if (remainingPlayers.length === 1) {
        return this.endRound(room, remainingPlayers[0].id);
      }

      // Move to next player or advance betting round if action is 'seen'
      if (action.action !== 'seen') {
        const nextTurnResult = this.advanceTurn(room, players);
        if (nextTurnResult.roundComplete) {
          return this.advanceToNextPhase(room);
        }
      }

      return { gameState: room.gameState };
    } catch (error) {
      Logger.error('Failed to process player action', error);
      return { gameState: room.gameState, error: 'Failed to process action' };
    }
  }

  /**
   * Execute the specific player action with proper validation
   */
  private static executePlayerAction(
    room: Room, 
    player: Player, 
    action: PlayerAction, 
  ): { error?: string } {
    const callAmount = room.gameState.currentCallAmount;
    const blindAmount = room.gameState.curretBlindAmount;
    

    switch (action.action) {
      case 'fold':
        player.hasFolded = true;
        Logger.debug(`Player folded`, { playerId: action.playerId, roomId: room.id });
        return {};

      case 'check':
        const canCheck = player.hasSeenCards ? player.currentBet === callAmount : player.currentBet === blindAmount;
        // Can only check if no bet to call
        if (!canCheck) {
          return { error: 'Cannot check - there is a bet to call' };
        }
        Logger.debug(`Player checked`, { playerId: action.playerId });
        return {};

      case 'call':
        const callBetAmount = action.amount || callAmount;
        if (callBetAmount <= 0) {
          return { error: 'Nothing to call' };
        }
        if (!player.hasSeenCards) {
          return { error: 'Must see cards before calling' };
        }
        if (player.balance < callBetAmount) {
          // All-in for less than call amount
          const allInAmount = player.balance;
          player.currentBet += allInAmount;
          room.gameState.pot += allInAmount;
          player.balance = 0;
          Logger.debug(`Player called all-in`, { playerId: action.playerId, amount: allInAmount });
        } else {
          player.currentBet += callBetAmount;
          player.balance -= callBetAmount;
          room.gameState.pot += callBetAmount;
          Logger.debug(`Player called`, { playerId: action.playerId, amount: callBetAmount });
        }
        return {};

      case 'raise':
        if (!action.amount || action.amount <= 0) {
          return { error: 'Invalid raise amount' };
        }
        
        const raiseAmount = action.amount;
        const totalRaiseAmount = player.hasSeenCards ? callAmount + raiseAmount : blindAmount + raiseAmount;
        
        if (player.balance < totalRaiseAmount) {
          return { error: 'Insufficient balance for raise' };
        }
        
        player.currentBet = totalRaiseAmount;
        player.balance -= totalRaiseAmount;
        room.gameState.pot += totalRaiseAmount;
        
        if (player.hasSeenCards) {
          room.gameState.currentCallAmount = totalRaiseAmount;
          room.gameState.curretBlindAmount = totalRaiseAmount / 2;
        } else {
          room.gameState.currentCallAmount = totalRaiseAmount * 2;
          room.gameState.curretBlindAmount = totalRaiseAmount;
        }
        
        Logger.debug(`Player raised`, { playerId: action.playerId, amount: totalRaiseAmount });
        return {};

      case 'seen':
        if (player.hasSeenCards) {
          return { error: 'Already seen cards' };
        }
                
        player.hasSeenCards = true;
        Logger.debug(`Player seen cards`, { playerId: action.playerId });
        return {};

      case 'blind':
        const blindBetAmount = action.amount || blindAmount;
        if (player.hasSeenCards) {
          return { error: 'Cannot play blind after seeing cards' };
        }

        if (player.balance < blindBetAmount) {
          return { error: 'Insufficient balance to play blind' };
        }
        
        player.currentBet += blindBetAmount;
        player.balance -= blindBetAmount;
        room.gameState.pot += blindBetAmount;
        
        Logger.debug(`Player played blind`, { playerId: action.playerId, amount: blindBetAmount });
        return {};

      default:
        return { error: 'Invalid action' };
    }
  }

  /**
   * Advance to the next player's turn or complete the betting round
   */
  private static advanceTurn(room: Room, allPlayers: Player[]): { roundComplete: boolean } {
    const activePlayers = allPlayers.filter(p => p.isConnected && !p.hasFolded);
    
    if (activePlayers.length <= 1) {
      return { roundComplete: true };
    }

    // Check if betting round is complete
    const allBetsEqual = this.allPlayersHaveActed(room, activePlayers)
    
    // Complete round when all players have acted and bets are equal
    if (allBetsEqual) {
      return { roundComplete: true };
    }
    
    // Move to next active player
    room.gameState.currentTurn = this.getNextActivePlayerIndex(room, activePlayers);
    return { roundComplete: false };
  }

  /**
   * Get the next active player index
   */
  private static getNextActivePlayerIndex(room: Room, activePlayers: Player[]): number {
    let nextIndex = room.gameState.currentTurn;
    let attempts = 0;
    
    do {
      nextIndex = (nextIndex + 1) % activePlayers.length;
      attempts++;
      
      // Safety check to prevent infinite loop
      if (attempts > activePlayers.length) {
        Logger.warn('Could not find next active player, staying on current turn');
        return room.gameState.currentTurn;
      }
    } while (activePlayers[nextIndex]?.hasFolded || !activePlayers[nextIndex]?.isConnected);
    
    return nextIndex;
  }

  /**
   * Check if betting has completed a full circle for preflop
   */
  private static hasCompletedBettingCircle(room: Room, activePlayers: Player[], bigBlindIndex: number): boolean {
    // In preflop, betting completes when action comes back to the big blind
    const currentTurnPlayer = activePlayers[room.gameState.currentTurn];
    if (!currentTurnPlayer) return true;
    
    // Find the big blind player in the active players array
    const allPlayers = Array.from(room.players.values()).filter(p => p.isConnected);
    const bigBlindPlayer = allPlayers[bigBlindIndex];
    
    return currentTurnPlayer.id === bigBlindPlayer.id && activePlayers.length > 1;
  }

  /**
   * Get big blind player index
   */
  private static getBigBlindIndex(playerCount: number, dealerIndex: number): number {
    if (playerCount === 2) {
      return (dealerIndex + 1) % playerCount; // Heads-up: non-dealer is big blind
    } else {
      return (dealerIndex + 2) % playerCount; // Multi-way: second left of dealer
    }
  }

  /**
   * Check if all active players have had a chance to act this round
   */
  private static allPlayersHaveActed(room: Room, activePlayers: Player[]): boolean {
    if (room.gameState.currentCallAmount === 0 && room.gameState.curretBlindAmount === 0) {
      // No bets made yet, check if current player is the dealer
      const dealerIndex = room.gameState.dealerIndex;
      const currentTurn = room.gameState.currentTurn;
      return dealerIndex === currentTurn;
    }
    
    return activePlayers.every(p => (p.hasSeenCards ? (p.currentBet === room.gameState.currentCallAmount) : (p.currentBet === room.gameState.curretBlindAmount)) || p.balance === 0); 
  }

  /**
   * Advance to the next phase of the poker hand following Texas Hold'em structure
   * Preflop → Flop (3 cards) → Turn (4th card) → River (5th card) → Showdown
   */
  private static advanceToNextPhase(room: Room): { gameState: GameState; error?: string } {
    try {
      const players = Array.from(room.players.values()).filter(p => p.isConnected);
      
      // Reset current bets for next betting round
      players.forEach(player => {
        player.currentBet = 0;
      });

      // Advance to next phase following Texas Hold'em structure
      switch (room.gameState.roundPhase) {
        case 'preflop':
          room.gameState.roundPhase = 'flop';
          room.gameState.cardsOnTable = 3; // First 3 community cards
          Logger.info(`🃏 FLOP - 3 cards revealed`, { roomId: room.id });
          break;
          
        case 'flop':
          room.gameState.roundPhase = 'turn';
          room.gameState.cardsOnTable = 4; // 4th community card
          Logger.info(`🃏 TURN - 4th card revealed`, { roomId: room.id });
          break;
          
        case 'turn':
          room.gameState.roundPhase = 'river';
          room.gameState.cardsOnTable = 5; // 5th and final community card

          players.forEach(player => {
            player.hasSeenCards = true; // All players will see cards after turn
          });

          Logger.info(`🃏 RIVER - 5th card revealed`, { roomId: room.id });
          break;
          
        case 'river':
          room.gameState.roundPhase = 'showdown';
          Logger.info(`🎯 SHOWDOWN - Final betting complete`, { roomId: room.id });
          return this.handleShowdown(room);
          
        case 'showdown':
          return this.endRound(room);
          
        default:
          return { gameState: room.gameState, error: 'Invalid game phase' };
      }
      
      // Reset minimum bet for next round
      room.gameState.currentCallAmount = 0;
      room.gameState.curretBlindAmount = 0;

      // Set first to act for post-flop betting (left of dealer, as per Texas Hold'em rules)
      const activePlayers = players.filter(p => !p.hasFolded && p.isConnected);
      if (activePlayers.length > 1) {
        room.gameState.currentTurn = this.getFirstToActPostflop(players, room.gameState.dealerIndex);
        Logger.debug(`Setting first to act post-flop`, { 
          roomId: room.id, 
          firstToAct: room.gameState.currentTurn,
          activePlayers: activePlayers.length
        });
      }

      return { gameState: room.gameState };
    } catch (error) {
      Logger.error('Failed to advance to next phase', error);
      return { gameState: room.gameState, error: 'Failed to advance phase' };
    }
  }

  /**
   * Handle the showdown phase - determine winner or split pot
   */
  private static handleShowdown(room: Room): { gameState: GameState; error?: string } {
    const activePlayers = Array.from(room.players.values()).filter(p => p.isConnected && !p.hasFolded);
    
    if (activePlayers.length === 1) {
      // Only one player left - they win by default (others folded)
      Logger.info(`🏆 Single player wins by fold`, { 
        roomId: room.id, 
        winnerId: activePlayers[0].id,
        potAmount: room.gameState.pot
      });
      return this.endRound(room, activePlayers[0].id);
    }

    if (activePlayers.length === 0) {
      // Safety check - shouldn't happen
      Logger.warn(`No active players in showdown`, { roomId: room.id });
      return this.endRound(room);
    }

    // For this pot calculator implementation, we'll split the pot equally
    // In a real poker game, you would evaluate hand strength here
    Logger.info(`🎯 Showdown phase - pot will be split equally`, { 
      roomId: room.id, 
      remainingPlayers: activePlayers.length,
      potAmount: room.gameState.pot
    });
    
    return this.endRound(room);
  }

  /**
   * End the current round/hand and prepare for next hand
   * Distribute pot, rotate dealer, reset game state
   */
  private static endRound(room: Room, winnerId?: string): { gameState: GameState; error?: string } {
    try {
      const players = Array.from(room.players.values()).filter(p => p.isConnected);
      const potAmount = room.gameState.pot;
      
      // Distribute the pot
      if (winnerId) {
        // Single winner gets the entire pot
        const winner = room.players.get(winnerId);
        if (winner) {
          winner.balance += potAmount;
          Logger.info(`💰 Round ended - Single winner`, { 
            roomId: room.id, 
            winnerId, 
            winnerName: winner.username,
            potWon: potAmount,
            newBalance: winner.balance
          });
        }
      } else {
        // Split pot equally among remaining active players
        const activePlayers = players.filter(p => !p.hasFolded);
        if (activePlayers.length > 0) {
          const potShare = Math.floor(potAmount / activePlayers.length);
          const remainder = potAmount % activePlayers.length;
          
          activePlayers.forEach((player, index) => {
            // Give remainder to first player(s) if pot doesn't divide evenly
            const extraChip = index < remainder ? 1 : 0;
            player.balance += potShare + extraChip;
          });
          
          Logger.info(`💰 Round ended - Pot split equally`, { 
            roomId: room.id, 
            winners: activePlayers.length,
            potShare,
            remainder,
            totalPot: potAmount
          });
        }
      }

      // Rotate dealer button clockwise (key Texas Hold'em rule)
      const connectedPlayers = players.filter(p => p.isConnected);
      const oldDealerIndex = room.gameState.dealerIndex;
      room.gameState.dealerIndex = (room.gameState.dealerIndex + 1) % connectedPlayers.length;
      
      Logger.info(`🔄 Dealer button rotated`, { 
        roomId: room.id,
        oldDealer: oldDealerIndex,
        newDealer: room.gameState.dealerIndex,
        newDealerName: connectedPlayers[room.gameState.dealerIndex]?.username
      });
      
      // Reset game state for next hand
      room.gameState.isGameInProgress = false;
      room.gameState.pot = 0;
      room.gameState.currentRound += 1;
      room.gameState.roundPhase = 'preflop';
      room.gameState.cardsOnTable = 0;
      room.gameState.currentTurn = 0;
      room.gameState.curretBlindAmount = room.settings.initialBetAmount;
      room.gameState.currentCallAmount = room.settings.initialBetAmount * 2; // Big blind amount
      room.gameState.lastAction = undefined;
      
      // Reset all players for next hand
      players.forEach(player => {
        player.currentBet = 0;
        player.hasFolded = false;
        player.hasSeenCards = false;
        player.isDealer = false; // Will be set for the new dealer when game starts
      });

      Logger.info(`🎮 Round ${room.gameState.currentRound - 1} completed, ready for next hand`, {
        roomId: room.id,
        nextRound: room.gameState.currentRound,
        playersRemaining: connectedPlayers.length
      });

      return { gameState: room.gameState };
    } catch (error) {
      Logger.error('Failed to end round', error);
      return { gameState: room.gameState, error: 'Failed to end round' };
    }
  }

  /**
   * Update player balance (host only)
   */
  static updatePlayerBalance(room: Room, playerId: string, newBalance: number): boolean {
    try {
      const player = room.players.get(playerId);
      if (!player) {
        Logger.warn('Player not found for balance update', { playerId, roomId: room.id });
        return false;
      }

      const oldBalance = player.balance;
      player.balance = Math.max(0, newBalance); // Ensure non-negative balance
      
      Logger.info('Player balance updated', { 
        roomId: room.id,
        playerId,
        playerName: player.username,
        oldBalance,
        newBalance: player.balance
      });

      return true;
    } catch (error) {
      Logger.error('Failed to update player balance', error);
      return false;
    }
  }

  /**
   * Update room settings (host only, when game is not in progress)
   */
  static updateRoomSettings(room: Room, newSettings: Partial<RoomSettings>): boolean {
    try {
      if (room.gameState.isGameInProgress) {
        Logger.warn('Cannot update settings during active game', { roomId: room.id });
        return false;
      }

      // Update settings with validation
      if (newSettings.initialBalance !== undefined) {
        room.settings.initialBalance = Math.max(1, newSettings.initialBalance);
      }
      
      if (newSettings.initialBetAmount !== undefined) {
        room.settings.initialBetAmount = Math.max(1, newSettings.initialBetAmount);
        room.gameState.curretBlindAmount = room.settings.initialBetAmount;
        room.gameState.currentCallAmount = room.settings.initialBetAmount * 2; // Big blind amount
      }
      
      if (newSettings.maxPlayers !== undefined) {
        room.settings.maxPlayers = Math.min(8, Math.max(2, newSettings.maxPlayers));
      }

      Logger.info('Room settings updated', { 
        roomId: room.id,
        newSettings: room.settings
      });

      return true;
    } catch (error) {
      Logger.error('Failed to update room settings', error);
      return false;
    }
  }
}
