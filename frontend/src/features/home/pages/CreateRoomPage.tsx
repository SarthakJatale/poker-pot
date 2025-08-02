import React, { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../shared/components';
import { useSocket } from '../../../shared/hooks';
import { ROUTES } from '../../../app/routes';

// Lazy load the create room form component
const CreateRoomForm = React.lazy(() => import('../components/CreateRoomForm'));

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (data: { roomId: string; room: any }) => {
      // Navigate to the room page when room is created
      navigate(ROUTES.ROOM.replace(':roomId', data.roomId));
    };

    socket.on('room-created', handleRoomCreated);

    return () => {
      socket.off('room-created', handleRoomCreated);
    };
  }, [socket, navigate]);

  const handleBack = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <div className="home-page">
      <Suspense fallback={<LoadingSpinner message="Loading create room form..." />}>
        <CreateRoomForm 
          socket={socket} 
          onBack={handleBack} 
        />
      </Suspense>
    </div>
  );
};

export default CreateRoomPage;
