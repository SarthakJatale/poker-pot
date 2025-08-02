import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary, LoadingSpinner } from '../../shared/components';
import { ROUTES } from '../routes';

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import('../../features/home/pages/HomePage'));
const CreateRoomPage = React.lazy(() => import('../../features/home/pages/CreateRoomPage'));
const JoinRoomPage = React.lazy(() => import('../../features/home/pages/JoinRoomPage'));
const RoomPage = React.lazy(() => import('../../features/game/pages/RoomPage'));

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.CREATE_ROOM} element={<CreateRoomPage />} />
            <Route path={ROUTES.JOIN_ROOM} element={<JoinRoomPage />} />
            <Route path={ROUTES.ROOM} element={<RoomPage />} />
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
};
