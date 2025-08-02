import React from 'react';
import type { Room } from '../../../shared/types/room.types';

interface RoomHeaderProps {
  room: Room;
  onLeaveRoom: () => void;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ room, onLeaveRoom }) => {
  return (
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
  );
};

export default RoomHeader;
