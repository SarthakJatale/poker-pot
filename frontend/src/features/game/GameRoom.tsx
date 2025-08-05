import React, { Suspense, useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { LoadingSpinner, Modal } from '../../shared/components';
import { HelpModalContent } from '../help';
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


// Winner selection modal
const WinnerSelectionModal: React.FC<{
  isHost: boolean;
  isOpen: boolean;
  players: Player[];
  onDeclare: (winnerIds: string[]) => void;
  onClose: () => void;
}> = ({ isHost = false, isOpen, players, onDeclare, onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => { if (!isOpen) setSelected([]); }, [isOpen]);

  if (isHost) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Select Winner(s)" size="medium">
        <div style={{ margin: '8px 12px', color: '#fff' }}>
          <p>Select the winner(s) for this round:</p>
          <ul style={{ listStyle: 'none' }}>
            {players.map(p => (
              <li key={p.id} style={{ margin: '8px 12px' }}>
                <label>
                  <input type="checkbox" checked={selected.includes(p.id)} onChange={() => setSelected(sel => sel.includes(p.id) ? sel.filter(x => x !== p.id) : [...sel, p.id])} />
                  <span style={{ marginLeft: 8 }}>{p.username}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="secondary">Cancel</button>
          <button onClick={() => onDeclare(selected)} className="primary" disabled={selected.length === 0}>Declare Winner(s)</button>
        </div>
      </Modal>
    );
  } else {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Winner Declaration" size="medium">
        <div style={{ margin: '8px 12px', color: '#fff' }}>
          <p>Waiting for host to declare the winner(s)...</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="secondary">Close</button>
        </div>
      </Modal>
    );
  }
};

const GameRoom: React.FC<GameRoomProps> = ({
  socket,
  room,
  currentPlayer,
  gameState,
  onLeaveRoom
}) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const isHost = currentPlayer.id === room.hostId;
  const actualGameState = gameState || room.gameState;
  const connectedPlayers = room.players.filter(p => p.isConnected);
  const currentTurnPlayer = connectedPlayers[actualGameState.currentTurn];

  // Show winner selection modal if host and awaitingWinnerDeclaration is true
  useEffect(() => {
    if (actualGameState.awaitingWinnerDeclaration) {
      setShowWinnerModal(true);
    } else {
      setShowWinnerModal(false);
    }
  }, [isHost, actualGameState.awaitingWinnerDeclaration]);

  const handleDeclareWinners = (winnerIds: string[]) => {
    if (!socket) return;
    console.log('Declaring winners:', winnerIds);
    socket.emit('declare-winner', winnerIds, (_res: any) => {
      setShowWinnerModal(false);
    });
  };

  const eligibleWinners = connectedPlayers.filter(p => !p.hasFolded);

  return (
    <div className="game-room">
      <Suspense fallback={<LoadingSpinner message="Loading room..." />}>
        <RoomHeader
          room={room}
          onLeaveRoom={onLeaveRoom}
          onShowHelp={() => setIsHelpModalOpen(true)}
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
        <div className="">
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
        </div>
      </Suspense>

      {/* Winner Selection Modal */}
      <WinnerSelectionModal
        isHost={isHost}
        isOpen={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        players={eligibleWinners}
        onDeclare={handleDeclareWinners}
      />

      {/* Help Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="🃏 Poker Help & Rules"
        size="fullscreen"
      >
        <HelpModalContent />
      </Modal>
    </div>
  );
};

export default GameRoom;
