import { Socket } from 'socket.io-client';
import type { Room, Player, GameState, SocketEventMap } from '../types';
import PlayerCard from './PlayerCard';
import GameControls from './GameControls';
import HostControls from './HostControls';

interface GameRoomProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  room: Room;
  currentPlayer: Player;
  gameState: GameState | null;
  onLeaveRoom: () => void;
}

export default function GameRoom({ socket, room, currentPlayer, gameState, onLeaveRoom }: GameRoomProps) {
  const isHost = currentPlayer.id === room.hostId;
  const actualGameState = gameState || room.gameState;

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('start-game');
  };

  const connectedPlayers = room.players.filter(p => p.isConnected);
  const currentTurnPlayer = connectedPlayers[actualGameState.currentTurn];

  return (
    <div className="game-room">
      <div className="room-header">
        <div className="room-info">
          <h1>Room: {room.id}</h1>
          <p>Host: {room.players.find(p => p.id === room.hostId)?.username}</p>
        </div>
        <div className="room-actions">
          <button onClick={onLeaveRoom} className="secondary">
            Leave Room
          </button>
        </div>
      </div>

      <div className="game-status">
        <div className="status-item">
          <span className="label">Round:</span>
          <span className="value">{actualGameState.currentRound}</span>
        </div>
        <div className="status-item">
          <span className="label">Phase:</span>
          <span className="value">{actualGameState.roundPhase}</span>
        </div>
        <div className="status-item">
          <span className="label">Pot:</span>
          <span className="value">${actualGameState.pot}</span>
        </div>
        <div className="status-item">
          <span className="label">Min Bet:</span>
          <span className="value">${actualGameState.minBetAmount}</span>
        </div>
        {actualGameState.cardsOnTable > 0 && (
          <div className="status-item">
            <span className="label">Cards on Table:</span>
            <span className="value">{actualGameState.cardsOnTable}</span>
          </div>
        )}
      </div>

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

      <div className="players-grid">
        {connectedPlayers.map((player) => (
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

      <div className="game-area">
        {!actualGameState.isGameInProgress ? (
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
        ) : (
          <GameControls
            socket={socket}
            currentPlayer={currentPlayer}
            gameState={actualGameState}
            room={room}
          />
        )}
      </div>

      {isHost && (
        <HostControls
          socket={socket}
          room={room}
          gameState={actualGameState}
        />
      )}
    </div>
  );
}
