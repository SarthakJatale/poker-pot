export const AVATARS = [
  '👤', '👥', '🎭', '🎪', '🎨', '🎯', '🎲', '🃏',
  '🦄', '🐱', '🐶', '🐻', '🦊', '🐼', '🐸', '🐙'
] as const;

export const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const ROUTES = {
  HOME: '/',
  ROOM: '/room/:roomId',
} as const;

export const DEFAULT_ROOM_SETTINGS = {
  initialBalance: 1000,
  initialBetAmount: 10,
  maxPlayers: 6,
} as const;
