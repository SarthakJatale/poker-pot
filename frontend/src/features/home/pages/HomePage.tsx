import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../shared/components';
import { ROUTES } from '../../../app/routes';

// Lazy load the welcome screen component
const WelcomeScreen = React.lazy(() => import('../components/WelcomeScreen'));

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate(ROUTES.CREATE_ROOM);
  };

  const handleJoinRoom = () => {
    navigate(ROUTES.JOIN_ROOM);
  };

  return (
    <div className="home-page">
      <Suspense fallback={<LoadingSpinner message="Loading..." />}>
        <WelcomeScreen 
          onCreateRoom={handleCreateRoom} 
          onJoinRoom={handleJoinRoom} 
        />
      </Suspense>
    </div>
  );
};

export default HomePage;
