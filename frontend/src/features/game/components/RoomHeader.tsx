import React, { useState } from 'react';
import type { Room } from '../../../shared/types/room.types';

interface RoomHeaderProps {
  room: Room;
  onLeaveRoom: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ room, onLeaveRoom }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy room ID:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = room.id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="room-header">
      <div className="room-info">
        <h2>Room: {room.id}</h2>
        <div className="room-id-tip">
          <small 
            className="copy-tip" 
            onClick={copyRoomId}
            title="Click to copy room ID"
          >
            {copySuccess ? '✓ Copied!' : '📋 Click to copy room ID'}
          </small>
        </div>
        <p>Host: {room.players.find(p => p.id === room.hostId)?.username}</p>
      </div>
      <div className="room-actions">
        <button onClick={onLeaveRoom} className="danger">
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default RoomHeader;
