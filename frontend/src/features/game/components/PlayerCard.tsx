import React from 'react';
import { Socket } from 'socket.io-client';
import type { Player } from '../../../shared/types/player.types';
import type { SocketEventMap } from '../../../shared/types';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
  isHost: boolean;
  socket: Socket<SocketEventMap, SocketEventMap> | null;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  isCurrentPlayer, 
  isCurrentTurn 
}) => {
  return (
    <div className={`player-card ${isCurrentPlayer ? 'current-player' : ''} ${isCurrentTurn ? 'current-turn' : ''} ${player.hasFolded ? 'folded' : ''}`}>
      <div className="player-header">
        <div className="player-avatar">{player.avatar}</div>
        <div className="player-name">
          {player.username}
          {player.isDealer && <span className="dealer-chip">D</span>}
          {!player.isConnected && <span className="offline">OFFLINE</span>}
        </div>
      </div>
      
      <div className="player-stats">
        <div className="stat">
          <span className="label">Balance:</span>
          <span className="value">${player.balance}</span>
        </div>
        <div className="stat">
          <span className="label">Current Bet:</span>
          <span className="value">${player.currentBet}</span>
        </div>
      </div>

      <div className="player-status">
        {player.hasFolded && <span className="status folded">FOLDED</span>}
        {player.hasSeenCards && !player.hasFolded && <span className="status seen">SEEN</span>}
        {!player.hasSeenCards && !player.hasFolded && <span className="status blind">BLIND</span>}
      </div>

      {isCurrentPlayer && (
        <div className="player-indicator">YOU</div>
      )}

      {isCurrentTurn && !player.hasFolded && (
        <div className="turn-indicator">TURN</div>
      )}
    </div>
  );
};

export default PlayerCard;
