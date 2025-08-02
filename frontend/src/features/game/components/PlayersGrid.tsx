import React from 'react';
import { Socket } from 'socket.io-client';
import PlayerCard from './PlayerCard';
import type { Player } from '../../../shared/types/player.types';
import type { SocketEventMap } from '../../../shared/types';

interface PlayersGridProps {
  players: Player[];
  currentPlayer: Player;
  currentTurnPlayer?: Player;
  isHost: boolean;
  socket: Socket<SocketEventMap, SocketEventMap> | null;
}

const PlayersGrid: React.FC<PlayersGridProps> = ({
  players,
  currentPlayer,
  currentTurnPlayer,
  isHost,
  socket,
}) => {
  return (
    <div className="players-grid">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === currentPlayer.id}
          isCurrentTurn={currentTurnPlayer?.id === player.id}
          isHost={isHost}
          socket={socket}
        />
      ))}
    </div>
  );
};

export default PlayersGrid;
