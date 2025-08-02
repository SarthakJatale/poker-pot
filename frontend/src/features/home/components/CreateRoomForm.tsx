import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { AVATARS, DEFAULT_ROOM_SETTINGS } from '../../../shared/constants';
import type { SocketEventMap } from '../../../shared/types';
import type { RoomSettings } from '../../../shared/types/room.types';

interface CreateRoomFormProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  onBack: () => void;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ socket, onBack }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0]);
  const [settings, setSettings] = useState<RoomSettings>(DEFAULT_ROOM_SETTINGS);

  const handleCreateRoom = () => {
    if (!socket || !username.trim()) return;
    
    socket.emit('create-room', {
      username: username.trim(),
      avatar: selectedAvatar,
      settings,
    });
  };

  const isFormValid = username.trim() && settings.initialBetAmount < settings.initialBalance;

  return (
    <div className="card">
      <h1>Create Room</h1>
      
      <div className="form-group">
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          maxLength={20}
        />
      </div>

      <div className="form-group">
        <label>Avatar:</label>
        <div className="avatar-grid">
          {AVATARS.map((avatar) => (
            <button
              key={avatar}
              className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
              onClick={() => setSelectedAvatar(avatar)}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Initial Balance:</label>
        <input
          type="number"
          value={settings.initialBalance}
          onChange={(e) => setSettings({ ...settings, initialBalance: parseInt(e.target.value) || 0 })}
          min="100"
          max="10000"
          step="50"
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
        />
      </div>

      <div className="form-group">
        <label>Max Players:</label>
        <select
          value={settings.maxPlayers}
          onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
        >
          {[2, 3, 4, 5, 6, 7, 8].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <div className="button-group">
        <button onClick={onBack} className="secondary">
          Back
        </button>
        <button 
          onClick={handleCreateRoom}
          disabled={!isFormValid}
          className="primary"
        >
          Create Room
        </button>
      </div>
    </div>
  );
};

export default CreateRoomForm;
