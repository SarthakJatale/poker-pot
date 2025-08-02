import { useState } from 'react';
import { Socket } from 'socket.io-client';
import type { SocketEventMap, RoomSettings } from '../types';
import { AVATARS } from '../types';

interface HomePageProps {
  socket: Socket<SocketEventMap, SocketEventMap> | null;
}

export default function HomePage({ socket }: HomePageProps) {
  const [view, setView] = useState<'main' | 'create' | 'join'>('main');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [roomId, setRoomId] = useState('');
  
  // Room settings for creation
  const [settings, setSettings] = useState<RoomSettings>({
    initialBalance: 1000,
    initialBetAmount: 50,
    maxPlayers: 6,
  });

  const handleCreateRoom = () => {
    if (!socket || !username.trim()) return;
    
    socket.emit('create-room', {
      username: username.trim(),
      avatar: selectedAvatar,
      settings,
    });
  };

  const handleJoinRoom = () => {
    if (!socket || !username.trim() || !roomId.trim()) return;
    
    socket.emit('join-room', {
      roomId: roomId.toUpperCase(),
      username: username.trim(),
      avatar: selectedAvatar,
    });
  };

  if (view === 'create') {
    return (
      <div className="home-page">
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
            <button onClick={() => setView('main')} className="secondary">
              Back
            </button>
            <button 
              onClick={handleCreateRoom}
              disabled={!username.trim() || settings.initialBetAmount >= settings.initialBalance}
              className="primary"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'join') {
    return (
      <div className="home-page">
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
            <button onClick={() => setView('main')} className="secondary">
              Back
            </button>
            <button 
              onClick={handleJoinRoom}
              disabled={!username.trim() || !roomId.trim() || roomId.length !== 6}
              className="primary"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="card">
        <h1>Poker Pot Calculator</h1>
        <p>Welcome to the ultimate poker pot and balance tracking app!</p>
        
        <div className="button-group">
          <button onClick={() => setView('create')} className="primary">
            Create Room
          </button>
          <button onClick={() => setView('join')} className="secondary">
            Join Room
          </button>
        </div>
        
        <div className="features">
          <h3>Features:</h3>
          <ul>
            <li>Track player balances and bets</li>
            <li>Automatic dealer rotation</li>
            <li>Support for Seen/Blind play</li>
            <li>Real-time multiplayer</li>
            <li>Host controls for balance management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
