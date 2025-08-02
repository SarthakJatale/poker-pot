import React, { Suspense } from 'react';
import { Socket } from 'socket.io-client';
import { LoadingSpinner } from '../../shared/components';
import type { SocketEventMap } from '../../shared/types';
import type { Room } from '../../shared/types/room.types';
import type { Player } from '../../shared/types/player.types';
import type { GameState } from '../../shared/types/game.types';

// Lazy load components for code splitting
const RoomHeader = React.lazy(() => import('./components/RoomHeader'));
const GameStatus = React.lazy(() => import('./components/GameStatus'));
const PlayersGrid = React.lazy(() => import('./components/PlayersGrid'));
const GameArea = React.lazy(() => import('./components/GameArea'));
const HostControls = React.lazy(() => import('./components/HostControls'));

interface GameRoomProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  room: Room;
  currentPlayer: Player;
  gameState: GameState | null;
  onLeaveRoom: () => void;
}

const GameRoom: React.FC<GameRoomProps> = ({ 
  socket, 
  room, 
  currentPlayer, 
  gameState, 
  onLeaveRoom 
}) => {
  const isHost = currentPlayer.id === room.hostId;
  const actualGameState = gameState || room.gameState;
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const currentTurnPlayer = connectedPlayers[actualGameState.currentTurn];

  return (
    <div className="game-room">
      <Suspense fallback={<LoadingSpinner message="Loading room..." />}>
        <RoomHeader 
          room={room} 
          onLeaveRoom={onLeaveRoom} 
        />
        
        <GameStatus 
          gameState={actualGameState} 
        />
        
        {actualGameState.isGameInProgress && currentTurnPlayer && (
          <div className="turn-indicator">
            <p>Current Turn: <strong>{currentTurnPlayer.username}</strong></p>
            {actualGameState.lastAction && (
              <p className="last-action">
                Last Action: {room.players.find(p => p.id === actualGameState.lastAction?.playerId)?.username} {actualGameState.lastAction.action}
                {actualGameState.lastAction.amount && ` $${actualGameState.lastAction.amount}`}
              </p>
            )}
          </div>
        )}
        
        <PlayersGrid 
          players={connectedPlayers}
          currentPlayer={currentPlayer}
          currentTurnPlayer={currentTurnPlayer}
          isHost={isHost}
          socket={socket}
        />
        
        <GameArea 
          socket={socket}
          room={room}
          currentPlayer={currentPlayer}
          gameState={actualGameState}
          connectedPlayers={connectedPlayers}
          isHost={isHost}
        />
        
        {isHost && (
          <HostControls
            socket={socket}
            room={room}
            gameState={actualGameState}
          />
        )}
      </Suspense>
    </div>
  );
};

export default GameRoom;
