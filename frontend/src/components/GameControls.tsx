import { useState } from 'react';
import { Socket } from 'socket.io-client';
import type { Player, GameState, Room, SocketEventMap } from '../types';

interface GameControlsProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  currentPlayer: Player;
  gameState: GameState;
  room: Room;
}

export default function GameControls({ socket, currentPlayer, gameState, room }: GameControlsProps) {
  const [raiseAmount, setRaiseAmount] = useState(1);
  
  const connectedPlayers = room.players.filter(p => p.isConnected && !p.hasFolded);
  const currentTurnPlayer = connectedPlayers[gameState.currentTurn];
  const isMyTurn = currentTurnPlayer?.id === currentPlayer.id;
  const maxBet = Math.max(...connectedPlayers.map(p => p.currentBet));
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
    if (!socket) return;
    
    socket.emit('player-action', {
      playerId: currentPlayer.id,
      action: action as any,
      amount,
    });
  };

  const canCheck = !needToCall;
  const canRaise = currentPlayer.balance >= (raiseAmount * room.settings.initialBetAmount);
  const canCall = currentPlayer.balance >= callAmount;
  const canPlaySeen = !currentPlayer.hasSeenCards && currentPlayer.balance >= (gameState.minBetAmount * 2);
  const canPlayBlind = !currentPlayer.hasSeenCards && currentPlayer.balance >= gameState.minBetAmount;

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
            Call ${callAmount}
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
            Play Blind ${gameState.minBetAmount}
          </button>
        )}

        {canPlaySeen && (
          <button 
            onClick={() => handleAction('seen')}
            className="action-btn seen"
          >
            Play Seen ${gameState.minBetAmount * 2}
          </button>
        )}

        <div className="raise-section">
          <div className="raise-input">
            <label>Raise (multiples of ${room.settings.initialBetAmount}):</label>
            <input
              type="number"
              min="1"
              max={Math.floor(currentPlayer.balance / room.settings.initialBetAmount)}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 1)}
            />
          </div>
          <button 
            onClick={() => handleAction('raise', raiseAmount)}
            disabled={!canRaise}
            className="action-btn raise"
          >
            Raise ${raiseAmount * room.settings.initialBetAmount}
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
}
