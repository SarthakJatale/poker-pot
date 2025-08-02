import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components';

interface AppRouterProps {
  children: React.ReactNode;
}

export const AppRouter: React.FC<AppRouterProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={children} />
          <Route path="/room/:roomId" element={children} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};
