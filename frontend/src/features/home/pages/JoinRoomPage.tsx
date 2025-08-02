import React, { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../shared/components';
import { useSocket } from '../../../shared/hooks';
import { ROUTES } from '../../../app/routes';

// Lazy load the join room form component
const JoinRoomForm = React.lazy(() => import('../components/JoinRoomForm'));

const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (data: { room: any; playerId: string }) => {
      // Navigate to the room page when successfully joined
      navigate(ROUTES.ROOM.replace(':roomId', data.room.id));
    };

    socket.on('room-joined', handleRoomJoined);

    return () => {
      socket.off('room-joined', handleRoomJoined);
    };
  }, [socket, navigate]);

  const handleBack = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <div className="home-page">
      <Suspense fallback={<LoadingSpinner message="Loading join room form..." />}>
        <JoinRoomForm 
          socket={socket} 
          onBack={handleBack} 
        />
      </Suspense>
    </div>
  );
};

export default JoinRoomPage;
