import React, { useRef, useEffect } from 'react';
import PlayerCard from './PlayerCard';
import type { Player } from '../../../shared/types/player.types';

interface PlayersCarouselProps {
  players: Player[];
  currentPlayer: Player;
  currentTurnPlayer?: Player;
  onCardChange?: (index: number) => void;
}

const PlayersCarousel: React.FC<PlayersCarouselProps> = ({
  players,
  currentPlayer,
  currentTurnPlayer,
  onCardChange,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Go to current turn player when it changes
  useEffect(() => {
    if (currentTurnPlayer) {
      const idx = players.findIndex(p => p.id === currentTurnPlayer.id);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [currentTurnPlayer, players]);

  // Swipe handlers
  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;
    let startX = 0;
    let isDragging = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      if (Math.abs(dx) > 50) {
        if (dx < 0 && currentIndex < players.length - 1) {
          setCurrentIndex(i => Math.min(i + 1, players.length - 1));
          isDragging = false;
        } else if (dx > 0 && currentIndex > 0) {
          setCurrentIndex(i => Math.max(i - 1, 0));
          isDragging = false;
        }
      }
    };
    const onTouchEnd = () => {
      isDragging = false;
    };
    node.addEventListener('touchstart', onTouchStart);
    node.addEventListener('touchmove', onTouchMove);
    node.addEventListener('touchend', onTouchEnd);
    return () => {
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentIndex, players.length]);

  useEffect(() => {
    if (onCardChange) onCardChange(currentIndex);
  }, [currentIndex, onCardChange]);

  return (
    <div className="players-carousel" ref={carouselRef}>
      <div
        className="carousel-track"
        style={{
          display: 'flex',
          transition: 'transform 0.3s',
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {players.map((player) => (
          <div
            key={player.id}
            className="carousel-card"
            style={{ minWidth: '100%', boxSizing: 'border-box' }}
          >
            <PlayerCard
              player={player}
              isCurrentPlayer={player.id === currentPlayer.id}
              isCurrentTurn={currentTurnPlayer?.id === player.id}
              isHost={false}
              socket={null}
            />
          </div>
        ))}
      </div>
      <div className="carousel-pagination">
        {players.map((_, idx) => (
          <span
            key={idx}
            className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayersCarousel;
