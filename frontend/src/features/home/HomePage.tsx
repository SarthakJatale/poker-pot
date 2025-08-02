import React, { Suspense } from 'react';
import { LoadingSpinner } from '../../shared/components';
import type { UseSocketReturn } from '../../shared/hooks';

// Lazy load components for code splitting
const CreateRoomForm = React.lazy(() => import('./components/CreateRoomForm'));
const JoinRoomForm = React.lazy(() => import('./components/JoinRoomForm'));
const WelcomeScreen = React.lazy(() => import('./components/WelcomeScreen'));

interface HomePageProps {
  socket: UseSocketReturn['socket'];
}

export type HomeView = 'main' | 'create' | 'join';

const HomePage: React.FC<HomePageProps> = ({ socket }) => {
  const [view, setView] = React.useState<HomeView>('main');

  const renderContent = () => {
    switch (view) {
      case 'create':
        return <CreateRoomForm socket={socket} onBack={() => setView('main')} />;
      case 'join':
        return <JoinRoomForm socket={socket} onBack={() => setView('main')} />;
      default:
        return <WelcomeScreen onCreateRoom={() => setView('create')} onJoinRoom={() => setView('join')} />;
    }
  };

  return (
    <div className="home-page">
      <Suspense fallback={<LoadingSpinner message="Loading..." />}>
        {renderContent()}
      </Suspense>
    </div>
  );
};

export default HomePage;
