import React from 'react';
import { useAppNavigation } from '../../../shared/hooks';

interface WelcomeScreenProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateRoom, onJoinRoom }) => {
  const { navigate } = useAppNavigation();

  const handleHelpClick = () => {
    navigate('/help');
  };

  return (
    <div className="card">
      <h1>Poker Pot Calculator</h1>
      <p>Welcome to the ultimate poker pot and balance tracking app!</p>
      
      <div className="button-group">
        <button onClick={onCreateRoom} className="primary">
          Create Room
        </button>
        <button onClick={onJoinRoom} className="secondary">
          Join Room
        </button>
        <button onClick={handleHelpClick} className="help-button">
          📖 Help & Rules
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
  );
};

export default WelcomeScreen;
