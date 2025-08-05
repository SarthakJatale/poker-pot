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
  const [raiseAmount, setRaiseAmount] = useState(room.settings.initialBetAmount);
  const { showError } = useToastActions();
  
  const activePlayers = room.players.filter((p: Player) => p.isConnected && !p.hasFolded);
  const currentTurnPlayer = activePlayers[gameState.currentTurn];
  const isMyTurn = currentTurnPlayer?.id === currentPlayer.id;
  const callAmount = gameState.currentCallAmount;
  const blindAmount = gameState.curretBlindAmount;
  const needToBet = currentPlayer.hasSeenCards ? callAmount > currentPlayer.currentBet : blindAmount > currentPlayer.currentBet;

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

  const handleRaiseIncrement = () => {
    if (raiseAmount <= currentPlayer.balance) {
      setRaiseAmount(prev => prev + room.settings.initialBetAmount);
    }
  };

  const handleRaiseDecrement = () => {
    if (raiseAmount > room.settings.initialBetAmount) {
      setRaiseAmount(prev => prev - room.settings.initialBetAmount);
    }
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
  const canCheck = !needToBet && room.gameState.roundPhase !== 'showdown';
  const canRaise = currentPlayer.balance >= (currentPlayer.hasSeenCards ? (callAmount + raiseAmount) : (blindAmount + raiseAmount)) && raiseAmount > 0;
  const canCall = callAmount > 0 && currentPlayer.balance >= callAmount && currentPlayer.hasSeenCards; // Only show call if there's something to call
  const canPlayBlind = !currentPlayer.hasSeenCards && blindAmount > 0 && currentPlayer.balance >= blindAmount;

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

        {needToBet && canCall && (
          <button 
            onClick={() => handleAction('call', callAmount - currentPlayer.currentBet)}
            className="action-btn call"
          >
            Call {formatCurrency(callAmount - currentPlayer.currentBet)}
          </button>
        )}

        {canCheck && (
          <button 
            onClick={() => handleAction('check')}
            className="action-btn check"
          >
            {room.gameState.roundPhase === 'river' ? "Show" : "Check"}
          </button>
        )}

        {canPlayBlind && (
          <button 
            onClick={() => handleAction('blind', blindAmount - currentPlayer.currentBet)}
            className="action-btn blind"
          >
            Play Blind {formatCurrency(blindAmount - currentPlayer.currentBet) }
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
      </div>
        
      <div className="raise-section">
        <div className="raise-input">
          <div role='button' onClick={handleRaiseDecrement} className="adjust-raise">
            -
          </div>
          <div className="raise-amount">
            {raiseAmount}
          </div>
          <div role='button' onClick={handleRaiseIncrement} className="adjust-raise">
            +
          </div>
        </div>
        <button 
          onClick={() => handleAction('raise', raiseAmount)}
          disabled={!canRaise}
          className="action-btn raise"
          >
          Raise by {formatCurrency(raiseAmount)}
        </button>
      </div>

      <div className="player-info">
        <p>Your Balance: {formatCurrency(currentPlayer.balance)}</p>
        <p>Current Bet: {formatCurrency(currentPlayer.currentBet)}</p>
        <p>Status: {currentPlayer.hasSeenCards ? 'Seen' : 'Blind'}</p>
      </div>
    </div>
  );
};

export default GameControls;
