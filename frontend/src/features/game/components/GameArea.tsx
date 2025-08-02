import React from 'react';
import { Socket } from 'socket.io-client';
import GameControls from './GameControls';
import type { Room } from '../../../shared/types/room.types';
import type { Player } from '../../../shared/types/player.types';
import type { GameState } from '../../../shared/types/game.types';
import type { SocketEventMap } from '../../../shared/types';

interface GameAreaProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  room: Room;
  currentPlayer: Player;
  gameState: GameState;
  connectedPlayers: Player[];
  isHost: boolean;
}

const GameArea: React.FC<GameAreaProps> = ({
  socket,
  room,
  currentPlayer,
  gameState,
  connectedPlayers,
  isHost,
}) => {
  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('start-game');
  };

  if (!gameState.isGameInProgress) {
    return (
      <div className="game-area">
        <div className="pre-game">
          <p>Waiting for game to start...</p>
          <p>Players: {connectedPlayers.length}/{room.settings.maxPlayers}</p>
          {isHost && connectedPlayers.length >= 2 && (
            <button onClick={handleStartGame} className="primary start-game">
              Start Game
            </button>
          )}
          {!isHost && (
            <p>Only the host can start the game.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="game-area">
      <GameControls
        socket={socket}
        currentPlayer={currentPlayer}
        gameState={gameState}
        room={room}
      />
    </div>
  );
};

export default GameArea;
