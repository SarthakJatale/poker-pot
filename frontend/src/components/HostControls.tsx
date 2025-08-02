import { useState } from 'react';
import { Socket } from 'socket.io-client';
import type { Room, GameState, SocketEventMap, RoomSettings } from '../types';

interface HostControlsProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  room: Room;
  gameState: GameState;
}

export default function HostControls({ socket, room, gameState }: HostControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showBalanceUpdate, setShowBalanceUpdate] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [newBalance, setNewBalance] = useState(0);
  
  const [settings, setSettings] = useState<RoomSettings>({
    initialBalance: room.settings.initialBalance,
    initialBetAmount: room.settings.initialBetAmount,
    maxPlayers: room.settings.maxPlayers,
  });

  const handleUpdateSettings = () => {
    if (!socket) return;
    
    socket.emit('update-settings', settings);
    setShowSettings(false);
  };

  const handleUpdateBalance = () => {
    if (!socket || !selectedPlayerId) return;
    
    socket.emit('update-balance', {
      playerId: selectedPlayerId,
      newBalance,
    });
    
    setShowBalanceUpdate(false);
    setSelectedPlayerId('');
    setNewBalance(0);
  };

  const openBalanceUpdate = (playerId: string, currentBalance: number) => {
    setSelectedPlayerId(playerId);
    setNewBalance(currentBalance);
    setShowBalanceUpdate(true);
  };

  return (
    <div className="host-controls">
      <h3>Host Controls</h3>
      
      <div className="host-actions">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          disabled={gameState.isGameInProgress}
          className="host-btn"
        >
          Room Settings
        </button>
        
        <button 
          onClick={() => setShowBalanceUpdate(!showBalanceUpdate)}
          disabled={gameState.isGameInProgress}
          className="host-btn"
        >
          Update Balances
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <h4>Room Settings</h4>
          <p className="warning">Settings can only be changed when the game is not in progress.</p>
          
          <div className="form-group">
            <label>Initial Balance:</label>
            <input
              type="number"
              value={settings.initialBalance}
              onChange={(e) => setSettings({ ...settings, initialBalance: parseInt(e.target.value) || 0 })}
              min="100"
              max="10000"
              step="50"
              disabled={gameState.isGameInProgress}
            />
          </div>

          <div className="form-group">
            <label>Initial Bet Amount:</label>
            <input
              type="number"
              value={settings.initialBetAmount}
              onChange={(e) => setSettings({ ...settings, initialBetAmount: parseInt(e.target.value) || 0 })}
              min="10"
              max="500"
              step="10"
              disabled={gameState.isGameInProgress}
            />
          </div>

          <div className="form-group">
            <label>Max Players:</label>
            <select
              value={settings.maxPlayers}
              onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
              disabled={gameState.isGameInProgress}
            >
              {[2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button onClick={() => setShowSettings(false)} className="secondary">
              Cancel
            </button>
            <button 
              onClick={handleUpdateSettings}
              disabled={gameState.isGameInProgress || settings.initialBetAmount >= settings.initialBalance}
              className="primary"
            >
              Update Settings
            </button>
          </div>
        </div>
      )}

      {showBalanceUpdate && (
        <div className="balance-panel">
          <h4>Update Player Balance</h4>
          <p className="warning">Balances can only be updated when the game is not in progress.</p>
          
          <div className="players-list">
            {room.players.filter(p => p.isConnected).map(player => (
              <div key={player.id} className="player-balance-item">
                <span className="player-info">
                  {player.avatar} {player.username}
                </span>
                <span className="current-balance">
                  Current: ${player.balance}
                </span>
                <button 
                  onClick={() => openBalanceUpdate(player.id, player.balance)}
                  disabled={gameState.isGameInProgress}
                  className="update-btn"
                >
                  Update
                </button>
              </div>
            ))}
          </div>

          {selectedPlayerId && (
            <div className="balance-update-form">
              <h5>Update Balance for {room.players.find(p => p.id === selectedPlayerId)?.username}</h5>
              <div className="form-group">
                <label>New Balance:</label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(parseInt(e.target.value) || 0)}
                  min="0"
                  max="50000"
                  step="10"
                />
              </div>
              <div className="button-group">
                <button onClick={() => setSelectedPlayerId('')} className="secondary">
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateBalance}
                  disabled={newBalance < 0}
                  className="primary"
                >
                  Update Balance
                </button>
              </div>
            </div>
          )}

          <div className="button-group">
            <button onClick={() => setShowBalanceUpdate(false)} className="secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
