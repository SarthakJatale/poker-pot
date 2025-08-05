import { Socket } from 'socket.io';
import { RoomService, GameService } from '../services';
import { SocketEventMap } from '../models';
import { Logger, ToastResponseHandler } from '../utils';
import { 
  validateCreateRoomData, 
  validateJoinRoomData, 
  validatePlayerAction, 
  validateBalanceUpdate,
  ValidationError 
} from '../validators';

export class SocketController {
  private currentRoomId: string | null = null;
  private currentPlayerId: string;
  private toastHandler: ToastResponseHandler;

  constructor(
    private socket: Socket<SocketEventMap, SocketEventMap>,
    private io: any // Socket.IO server instance
  ) {
    this.currentPlayerId = socket.id;
    this.toastHandler = new ToastResponseHandler(socket, io);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.socket.on('create-room', this.handleCreateRoom.bind(this));
    this.socket.on('join-room', this.handleJoinRoom.bind(this));
    this.socket.on('leave-room', this.handleLeaveRoom.bind(this));
    this.socket.on('start-game', this.handleStartGame.bind(this));
    this.socket.on('player-action', this.handlePlayerAction.bind(this));
    this.socket.on('declare-winner', this.handleDeclareWinners.bind(this));
    this.socket.on('update-balance', this.handleUpdateBalance.bind(this));
    this.socket.on('update-settings', this.handleUpdateSettings.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
  }

  private handleCreateRoom(data: any): void {
    try {
      validateCreateRoomData(data);
      
      const room = RoomService.createRoom(
        this.currentPlayerId, 
        data.username, 
        data.avatar, 
        data.settings
      );
      
      this.currentRoomId = room.id;
      this.socket.join(room.id);
      
      this.socket.emit('room-created', { 
        roomId: room.id, 
        room: RoomService.serializeRoom(room) 
      });
      
      Logger.info(`Room created successfully`, { 
        roomId: room.id, 
        username: data.username, 
        socketId: this.currentPlayerId 
      });

      // Send success toast
      this.toastHandler.sendSuccess(
        'Room Created Successfully!', 
        `Room ${room.id} created. Share this ID with your friends to join.`
      );
    } catch (error) {
      Logger.error('Failed to create room', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to create room';
      this.socket.emit('error', message);
      
      // Send error toast
      this.toastHandler.sendError(
        'Failed to Create Room',
        message
      );
    }
  }

  private handleJoinRoom(data: any): void {
    try {
      validateJoinRoomData(data);
      
      const { room, error } = RoomService.joinRoom(
        data.roomId, 
        this.currentPlayerId, 
        data.username, 
        data.avatar
      );
      
      if (error) {
        this.socket.emit('error', error);
        this.toastHandler.sendError('Failed to Join Room', error);
        return;
      }

      this.currentRoomId = data.roomId;
      this.socket.join(data.roomId);
      
      // Notify all players in the room
      const joinedPlayer = room.players.get(this.currentPlayerId)!;
      this.socket.to(data.roomId).emit('player-joined', joinedPlayer);
      this.socket.emit('room-joined', { 
        room: RoomService.serializeRoom(room), 
        playerId: this.currentPlayerId 
      });
      this.socket.to(data.roomId).emit('room-updated', RoomService.serializeRoom(room));
      
      Logger.info(`Player joined room successfully`, { 
        roomId: data.roomId, 
        username: data.username, 
        socketId: this.currentPlayerId 
      });

      // Send success toast to the joining player
      const playerCount = room.players.size;
      this.toastHandler.sendSuccess(
        'Successfully Joined Room!', 
        `Welcome to room ${data.roomId}. ${playerCount} players in room.`
      );

      // Send info toast to existing players
      this.toastHandler.sendInfoToRoom(
        data.roomId,
        'Player Joined',
        `${data.username} has joined the room`
      );
    } catch (error) {
      Logger.error('Failed to join room', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to join room';
      this.socket.emit('error', message);
      this.toastHandler.sendError('Failed to Join Room', message);
    }
  }

  private handleLeaveRoom(): void {
    this.leaveCurrentRoom();
  }

  private handleStartGame(): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        this.toastHandler.sendError('Cannot Start Game', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
        this.toastHandler.sendError('Cannot Start Game', 'Room not found');
        return;
      }

      if (room.hostId !== this.currentPlayerId) {
        this.socket.emit('error', 'Only the host can start the game');
        this.toastHandler.sendError('Cannot Start Game', 'Only the host can start the game');
        return;
      }

      const gameState = GameService.startGame(room);
      
      this.socket.to(this.currentRoomId).emit('game-started', gameState);
      this.socket.emit('game-started', gameState);
      this.socket.to(this.currentRoomId).emit('room-updated', RoomService.serializeRoom(room));
      this.socket.emit('room-updated', RoomService.serializeRoom(room));
      
      Logger.info(`Game started successfully`, { 
        roomId: this.currentRoomId, 
        hostId: this.currentPlayerId 
      });

      // Send success toast to all players
      this.toastHandler.sendSuccessToRoom(
        this.currentRoomId,
        'Game Started!',
        'The poker game has begun. Good luck!'
      );
    } catch (error) {
      Logger.error('Failed to start game', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to start game';
      this.socket.emit('error', message);
      this.toastHandler.sendError('Failed to Start Game', message);
    }
  }

  private handlePlayerAction(actionData: any): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        this.toastHandler.sendError('Invalid Action', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
        this.toastHandler.sendError('Invalid Action', 'Room not found');
        return;
      }

      validatePlayerAction(actionData);

      const action = {
        ...actionData,
        playerId: this.currentPlayerId,
        timestamp: Date.now(),
      };

      const { gameState, error } = GameService.processPlayerAction(room, action);
      
      if (error) {
        this.socket.emit('error', error);
        this.toastHandler.sendError('Action Failed', error);
        return;
      }

      this.socket.to(this.currentRoomId).emit('game-updated', gameState);
      this.socket.emit('game-updated', gameState);
      this.socket.to(this.currentRoomId).emit('room-updated', RoomService.serializeRoom(room));
      this.socket.emit('room-updated', RoomService.serializeRoom(room));
      
      Logger.debug(`Player action processed successfully`, { 
        roomId: this.currentRoomId, 
        playerId: this.currentPlayerId, 
        action: action.action 
      });

      // Send action confirmation (only to acting player to avoid spam)
      const actionMessages = {
        fold: 'You folded',
        call: 'You called',
        raise: `You raised to ${action.amount}`,
        check: 'You checked',
        bet: `You bet ${action.amount}`,
        all_in: 'You went all in!'
      };
      
      const message = actionMessages[action.action as keyof typeof actionMessages] || 'Action completed';
      this.toastHandler.sendInfo('Action Confirmed', message);
    } catch (error) {
      Logger.error('Failed to process player action', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to process action';
      this.socket.emit('error', message);
      this.toastHandler.sendError('Action Failed', message);
    }
  }

  private handleDeclareWinners(winnerIds: string[], callback: (res: any) => void): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        this.toastHandler.sendError('Cannot Declare Winners', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
        this.toastHandler.sendError('Cannot Declare Winners', 'Room not found');
        return;
      }

      if (room.hostId !== this.currentPlayerId) {
        this.socket.emit('error', 'Only the host can declare winners');
        this.toastHandler.sendError('Cannot Declare Winners', 'Only the host can declare winners');
        return;
      }

      const { gameState, error } = GameService.declareWinners(room, winnerIds);
      
      if (error) {
        this.socket.emit('error', error);
        this.toastHandler.sendError('Failed to Declare Winners', error);
        return;
      }

      this.socket.to(this.currentRoomId).emit('game-updated', gameState);
      this.socket.emit('game-updated', gameState);
      this.socket.to(this.currentRoomId).emit('room-updated', RoomService.serializeRoom(room));
      this.socket.emit('room-updated', RoomService.serializeRoom(room));
      
      Logger.info(`Winners declared successfully`, { 
        roomId: this.currentRoomId, 
        winnerIds 
      });

      // Send success toast to all players
      this.toastHandler.sendSuccessToRoom(
        this.currentRoomId,
        'Winners Declared!',
        `The winners are: ${winnerIds.join(', ')}`
      );

      callback({ success: true });
    } catch (error) {
      Logger.error('Failed to declare winners', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to declare winners';
      this.socket.emit('error', message);
      this.toastHandler.sendError('Failed to Declare Winners', message);
      callback({ success: false, error: message });
    }
  }

  private handleUpdateBalance(data: any): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        this.toastHandler.sendError('Cannot Update Balance', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
        this.toastHandler.sendError('Cannot Update Balance', 'Room not found');
        return;
      }

      if (room.gameState.isGameInProgress) {
        this.socket.emit('error', 'Cannot update balance during an active game');
        this.toastHandler.sendError('Cannot Update Balance', 'Cannot update balance during an active game');
        return;
      }

      validateBalanceUpdate(data);

      // Check if target player exists
      const targetPlayer = room.players.get(data.playerId);
      if (!targetPlayer) {
        this.socket.emit('error', 'Player not found');
        this.toastHandler.sendError('Cannot Update Balance', 'Player not found');
        return;
      }

      const success = GameService.updatePlayerBalance(room, data.playerId, data.newBalance);
      
      if (success) {
        this.socket.to(this.currentRoomId).emit('balance-updated', { 
          playerId: data.playerId, 
          newBalance: data.newBalance 
        });
        this.socket.emit('balance-updated', { 
          playerId: data.playerId, 
          newBalance: data.newBalance 
        });
        this.socket.to(this.currentRoomId).emit('room-updated', RoomService.serializeRoom(room));
        this.socket.emit('room-updated', RoomService.serializeRoom(room));
        
        Logger.info(`Balance updated successfully`, { 
          roomId: this.currentRoomId, 
          playerId: data.playerId, 
          newBalance: data.newBalance 
        });

        // Send success toast to host who updated the balance
        this.toastHandler.sendSuccess(
          'Balance Updated',
          `${targetPlayer.username}'s balance updated to $${data.newBalance}`
        );

        // Send info toast to the affected player if it's not the same as the updater
        if (data.playerId !== this.currentPlayerId) {
          this.toastHandler.sendInfoToPlayer(
            data.playerId,
            'Balance Updated',
            `Your balance has been updated to $${data.newBalance}`
          );
        }
      } else {
        this.socket.emit('error', 'Failed to update balance');
        this.toastHandler.sendError('Failed to Update Balance', 'Unable to update player balance');
      }
    } catch (error) {
      Logger.error('Failed to update balance', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to update balance';
      this.socket.emit('error', message);
      this.toastHandler.sendError('Failed to Update Balance', message);
    }
  }

  private handleUpdateSettings(settings: any): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        this.toastHandler.sendError('Cannot Update Settings', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
        this.toastHandler.sendError('Cannot Update Settings', 'Room not found');
        return;
      }

      if (room.hostId !== this.currentPlayerId) {
        this.socket.emit('error', 'Only the host can update settings');
        this.toastHandler.sendError('Cannot Update Settings', 'Only the host can update settings');
        return;
      }

      GameService.updateRoomSettings(room, settings);
      
      this.socket.to(this.currentRoomId).emit('room-updated', RoomService.serializeRoom(room));
      this.socket.emit('room-updated', RoomService.serializeRoom(room));
      
      Logger.info(`Settings updated successfully`, { 
        roomId: this.currentRoomId, 
        settings 
      });

      // Send success toast to host
      this.toastHandler.sendSuccess('Settings Updated', 'Room settings have been updated successfully');

      // Send info toast to other players
      this.toastHandler.sendInfoToRoom(
        this.currentRoomId,
        'Settings Updated',
        'The host has updated the room settings'
      );
    } catch (error) {
      Logger.error('Failed to update settings', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to update settings';
      this.socket.emit('error', message);
      this.toastHandler.sendError('Failed to Update Settings', message);
    }
  }

  private handleDisconnect(): void {
    Logger.info(`User disconnected`, { socketId: this.currentPlayerId });
    this.leaveCurrentRoom();
  }

  private leaveCurrentRoom(): void {
    if (!this.currentRoomId) return;

    try {
      const room = RoomService.getRoom(this.currentRoomId);
      const leavingPlayer = room?.players.get(this.currentPlayerId);
      
      const { room: updatedRoom, shouldDeleteRoom } = RoomService.leaveRoom(this.currentRoomId, this.currentPlayerId);
      
      if (shouldDeleteRoom) {
        Logger.info(`Room deleted after player left`, { roomId: this.currentRoomId });
        // Room is deleted, no need for toasts
      } else if (updatedRoom) {
        this.socket.to(this.currentRoomId).emit('player-left', this.currentPlayerId);
        this.socket.to(this.currentRoomId).emit('room-updated', RoomService.serializeRoom(updatedRoom));
        
        Logger.info(`Player left room`, { 
          roomId: this.currentRoomId, 
          playerId: this.currentPlayerId 
        });

        // Send info toast to remaining players if someone left
        if (leavingPlayer) {
          this.toastHandler.sendInfoToRoom(
            this.currentRoomId,
            'Player Left',
            `${leavingPlayer.username} has left the room`
          );
        }
      }
      
      this.socket.leave(this.currentRoomId);
      this.currentRoomId = null;
    } catch (error) {
      Logger.error('Failed to handle leave room', error);
    }
  }
}
