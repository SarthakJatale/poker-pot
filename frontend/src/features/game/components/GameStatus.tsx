import React from 'react';
import type { GameState } from '../../../shared/types/game.types';
import { formatCurrency } from '../../../shared';

interface GameStatusProps {
  gameState: GameState;
}

const GameStatus: React.FC<GameStatusProps> = ({ gameState }) => {
  return (
    <div className="game-status">
      <div className="status-item">
        <span className="label">Round:</span>
        <span className="value">{gameState.currentRound}</span>
      </div>
      <div className="status-item">
        <span className="label">Phase:</span>
        <span className="value">{gameState.roundPhase}</span>
      </div>
      <div className="status-item">
        <span className="label">Pot:</span>
        <span className="value">{formatCurrency(gameState.pot)}</span>
      </div>
      <div className="status-item">
        <span className="label">Min Call:</span>
        <span className="value">{formatCurrency(gameState.currentCallAmount)}</span>
      </div>
      <div className="status-item">
        <span className="label">Min Blind:</span>
        <span className="value">{formatCurrency(gameState.curretBlindAmount)}</span>
      </div>
      <div className="status-item">
        <span className="label">Cards on Table:</span>
        <span className="value">{gameState.cardsOnTable}</span>
      </div>
    </div>
  );
};

export default GameStatus;
