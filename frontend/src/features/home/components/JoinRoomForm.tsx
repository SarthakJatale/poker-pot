import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { AVATARS } from '../../../shared/constants';
import type { SocketEventMap } from '../../../shared/types';

interface JoinRoomFormProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
  onBack: () => void;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ socket, onBack }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0]);
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = () => {
    if (!socket || !username.trim() || !roomId.trim()) return;
    
    socket.emit('join-room', {
      roomId: roomId.toUpperCase(),
      username: username.trim(),
      avatar: selectedAvatar,
    });
  };

  const isFormValid = username.trim() && roomId.trim() && roomId.length === 6;

  return (
    <div className="card">
      <h1>Join Room</h1>
      
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
        <label>Room ID:</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          placeholder="Enter 6-character room ID"
          maxLength={6}
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div className="button-group">
        <button onClick={onBack} className="secondary">
          Back
        </button>
        <button 
          onClick={handleJoinRoom}
          disabled={!isFormValid}
          className="primary"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoomForm;
