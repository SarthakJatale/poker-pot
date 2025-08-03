import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useToastActions } from '../../../shared/hooks';
import type { Player } from '../../../shared/types/player.types';
import type { GameState } from '../../../shared/types/game.types';
import type { Room } from '../../../shared/types/room.types';
import type { SocketEventMap } from '../../../shared/types';
import { formatCurrency } from '../../../shared';

interface GameControlsProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  currentPlayer: Player;
  gameState: GameState;
  room: Room;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  socket, 
  currentPlayer, 
  gameState, 
  room 
}) => {
  const [raiseAmount, setRaiseAmount] = useState(1);
  const { showError } = useToastActions();
  
  // Match backend logic: first filter connected players, then get active players for turn logic
  const connectedPlayers = room.players.filter((p: Player) => p.isConnected);
  const activePlayers = connectedPlayers.filter((p: Player) => !p.hasFolded);
  const currentTurnPlayer = activePlayers[gameState.currentTurn];
  const isMyTurn = currentTurnPlayer?.id === currentPlayer.id;
  const maxBet = Math.max(...activePlayers.map((p: Player) => p.currentBet));
  const needToCall = maxBet > currentPlayer.currentBet;
  const callAmount = maxBet - currentPlayer.currentBet;

  if (!isMyTurn) {
    return (
      <div className="game-controls">
        <p>Waiting for other players...</p>
      </div>
    );
  }

  if (currentPlayer.hasFolded) {
    return (
      <div className="game-controls">
        <p>You have folded this round.</p>
      </div>
    );
  }

  const handleAction = (action: string, amount?: number) => {
    if (!socket) {
      showError('Connection Error', 'Not connected to server. Please refresh the page.');
      return;
    }
    
    // Validate action before sending
    if (action === 'call' && !canCall) {
      showError('Insufficient Funds', 'You do not have enough balance to call.');
      return;
    }
    
    if (action === 'raise' && !canRaise) {
      showError('Insufficient Funds', 'You do not have enough balance to raise.');
      return;
    }
    
    if (action === 'raise' && (!amount || amount <= 0)) {
      showError('Invalid Raise Amount', 'Please enter a valid raise amount.');
      return;
    }
    
    socket.emit('player-action', {
      playerId: currentPlayer.id,
      action: action as any,
      amount,
    });
  };

  // Action validation logic - match backend calculations
  const canCheck = !needToCall;
  const canRaise = currentPlayer.balance >= (callAmount + (raiseAmount * room.settings.initialBetAmount));
  const canCall = callAmount > 0 && currentPlayer.balance >= callAmount && currentPlayer.hasSeenCards; // Only show call if there's something to call
  const canPlayBlind = !currentPlayer.hasSeenCards && currentPlayer.balance >= (callAmount + gameState.minBetAmount);

  return (
    <div className="game-controls">
      <h3>Your Turn</h3>
      
      <div className="action-buttons">
        <button 
          onClick={() => handleAction('fold')}
          className="action-btn fold"
        >
          Fold
        </button>

        {needToCall && canCall && (
          <button 
            onClick={() => handleAction('call')}
            className="action-btn call"
          >
            Call {formatCurrency(callAmount)}
          </button>
        )}

        {canCheck && (
          <button 
            onClick={() => handleAction('check')}
            className="action-btn check"
          >
            Check
          </button>
        )}

        {canPlayBlind && (
          <button 
            onClick={() => handleAction('blind')}
            className="action-btn blind"
          >
            Play Blind {formatCurrency(callAmount / 2)}
          </button>
        )}

        {!currentPlayer.hasSeenCards && (
          <button 
            onClick={() => handleAction('seen')}
            className="action-btn seen"
          >
            See cards
          </button>
        )}

        <div className="raise-section">
          <div className="raise-input">
            <label>Raise (multiples of ${room.settings.initialBetAmount}):</label>
            <input
              type="number"
              min="1"
              max={Math.floor((currentPlayer.balance - callAmount) / room.settings.initialBetAmount)}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 1)}
            />
          </div>
          <button 
            onClick={() => handleAction('raise', raiseAmount)}
            disabled={!canRaise}
            className="action-btn raise"
          >
            Raise ${callAmount + (raiseAmount * room.settings.initialBetAmount)}
          </button>
        </div>
      </div>

      <div className="player-info">
        <p>Your Balance: ${currentPlayer.balance}</p>
        <p>Current Bet: ${currentPlayer.currentBet}</p>
        <p>Status: {currentPlayer.hasSeenCards ? 'Seen' : 'Blind'}</p>
      </div>
    </div>
  );
};

export default GameControls;
