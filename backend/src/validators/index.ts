import { RoomSettings, PlayerAction } from '../types';
import config from '../config';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateRoomSettings = (settings: RoomSettings): void => {
  if (!settings || typeof settings !== 'object') {
    throw new ValidationError('Room settings are required');
  }

  if (typeof settings.initialBalance !== 'number' || settings.initialBalance <= 0) {
    throw new ValidationError('Initial balance must be a positive number', 'initialBalance');
  }

  if (typeof settings.initialBetAmount !== 'number' || settings.initialBetAmount <= 0) {
    throw new ValidationError('Initial bet amount must be a positive number', 'initialBetAmount');
  }

  if (settings.initialBetAmount >= settings.initialBalance) {
    throw new ValidationError('Initial bet amount must be less than initial balance', 'initialBetAmount');
  }

  if (
    typeof settings.maxPlayers !== 'number' ||
    settings.maxPlayers < config.game.minPlayers ||
    settings.maxPlayers > config.game.maxPlayers
  ) {
    throw new ValidationError(
      `Max players must be between ${config.game.minPlayers} and ${config.game.maxPlayers}`,
      'maxPlayers'
    );
  }
};

export const validatePlayerAction = (action: Partial<PlayerAction>): void => {
  if (!action || typeof action !== 'object') {
    throw new ValidationError('Player action is required');
  }

  if (!action.action || typeof action.action !== 'string') {
    throw new ValidationError('Action type is required', 'action');
  }

  const validActions = ['fold', 'call', 'raise', 'check', 'blind', 'seen'];
  if (!validActions.includes(action.action)) {
    throw new ValidationError(`Invalid action. Must be one of: ${validActions.join(', ')}`, 'action');
  }

  if (action.action === 'raise' && (typeof action.amount !== 'number' || action.amount <= 0)) {
    throw new ValidationError('Raise amount must be a positive number', 'amount');
  }
};

export const validateJoinRoomData = (data: any): void => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Join room data is required');
  }

  if (!data.roomId || typeof data.roomId !== 'string' || data.roomId.length !== config.game.roomIdLength) {
    throw new ValidationError(`Room ID must be ${config.game.roomIdLength} characters long`, 'roomId');
  }

  if (!data.username || typeof data.username !== 'string' || data.username.trim().length === 0) {
    throw new ValidationError('Username is required', 'username');
  }

  if (data.username.length > 50) {
    throw new ValidationError('Username must be 50 characters or less', 'username');
  }

  if (!data.avatar || typeof data.avatar !== 'string') {
    throw new ValidationError('Avatar is required', 'avatar');
  }
};

export const validateCreateRoomData = (data: any): void => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Create room data is required');
  }

  if (!data.username || typeof data.username !== 'string' || data.username.trim().length === 0) {
    throw new ValidationError('Username is required', 'username');
  }

  if (data.username.length > 50) {
    throw new ValidationError('Username must be 50 characters or less', 'username');
  }

  if (!data.avatar || typeof data.avatar !== 'string') {
    throw new ValidationError('Avatar is required', 'avatar');
  }

  if (!data.settings) {
    throw new ValidationError('Room settings are required', 'settings');
  }

  validateRoomSettings(data.settings);
};

export const validateBalanceUpdate = (data: any): void => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Balance update data is required');
  }

  if (!data.playerId || typeof data.playerId !== 'string') {
    throw new ValidationError('Player ID is required', 'playerId');
  }

  if (typeof data.newBalance !== 'number' || data.newBalance < 0) {
    throw new ValidationError('New balance must be a non-negative number', 'newBalance');
  }
};
