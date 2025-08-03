import React, { useState } from 'react';
import { useToastActions } from '../../../shared/hooks';
import '../../../shared/components/styles.css';
import type { Room } from '../../../shared/types/room.types';

interface RoomHeaderProps {
  room: Room;
  onLeaveRoom: () => void;
  onShowHelp?: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ room, onLeaveRoom, onShowHelp }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const { showSuccess, showError } = useToastActions();

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopySuccess(true);
      showSuccess('Room ID Copied!', `Room ID ${room.id} copied to clipboard`);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy room ID:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = room.id;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        showSuccess('Room ID Copied!', `Room ID ${room.id} copied to clipboard`);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        showError('Copy Failed', 'Unable to copy room ID to clipboard');
      }
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
        {onShowHelp && (
          <button onClick={onShowHelp} className="help-btn" title="Show Help & Rules">
            ❓ Help
          </button>
        )}
        <button onClick={onLeaveRoom} className="danger">
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default RoomHeader;
