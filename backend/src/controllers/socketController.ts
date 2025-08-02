import { Socket } from 'socket.io';
import { RoomService, GameService } from '../services';
import { SocketEventMap } from '../models';
import { Logger } from '../utils';
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

  constructor(private socket: Socket<SocketEventMap, SocketEventMap>) {
    this.currentPlayerId = socket.id;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.socket.on('create-room', this.handleCreateRoom.bind(this));
    this.socket.on('join-room', this.handleJoinRoom.bind(this));
    this.socket.on('leave-room', this.handleLeaveRoom.bind(this));
    this.socket.on('start-game', this.handleStartGame.bind(this));
    this.socket.on('player-action', this.handlePlayerAction.bind(this));
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
    } catch (error) {
      Logger.error('Failed to create room', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to create room';
      this.socket.emit('error', message);
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
        return;
      }

      this.currentRoomId = data.roomId;
      this.socket.join(data.roomId);
      
      // Notify all players in the room
      this.socket.to(data.roomId).emit('player-joined', room.players.get(this.currentPlayerId)!);
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
    } catch (error) {
      Logger.error('Failed to join room', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to join room';
      this.socket.emit('error', message);
    }
  }

  private handleLeaveRoom(): void {
    this.leaveCurrentRoom();
  }

  private handleStartGame(): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== this.currentPlayerId) {
        this.socket.emit('error', 'Only the host can start the game');
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
    } catch (error) {
      Logger.error('Failed to start game', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to start game';
      this.socket.emit('error', message);
    }
  }

  private handlePlayerAction(actionData: any): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
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
    } catch (error) {
      Logger.error('Failed to process player action', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to process action';
      this.socket.emit('error', message);
    }
  }

  private handleUpdateBalance(data: any): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== this.currentPlayerId) {
        this.socket.emit('error', 'Only the host can update balances');
        return;
      }

      if (room.gameState.isGameInProgress) {
        this.socket.emit('error', 'Cannot update balance during an active game');
        return;
      }

      validateBalanceUpdate(data);

      // Check if target player exists
      const targetPlayer = room.players.get(data.playerId);
      if (!targetPlayer) {
        this.socket.emit('error', 'Player not found');
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
      } else {
        this.socket.emit('error', 'Failed to update balance');
      }
    } catch (error) {
      Logger.error('Failed to update balance', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to update balance';
      this.socket.emit('error', message);
    }
  }

  private handleUpdateSettings(settings: any): void {
    try {
      if (!this.currentRoomId) {
        this.socket.emit('error', 'Not in a room');
        return;
      }

      const room = RoomService.getRoom(this.currentRoomId);
      if (!room) {
        this.socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== this.currentPlayerId) {
        this.socket.emit('error', 'Only the host can update settings');
        return;
      }

      GameService.updateRoomSettings(room, settings);
      
      this.socket.to(this.currentRoomId).emit('room-updated', RoomService.serializeRoom(room));
      this.socket.emit('room-updated', RoomService.serializeRoom(room));
      
      Logger.info(`Settings updated successfully`, { 
        roomId: this.currentRoomId, 
        settings 
      });
    } catch (error) {
      Logger.error('Failed to update settings', error);
      const message = error instanceof ValidationError 
        ? error.message 
        : 'Failed to update settings';
      this.socket.emit('error', message);
    }
  }

  private handleDisconnect(): void {
    Logger.info(`User disconnected`, { socketId: this.currentPlayerId });
    this.leaveCurrentRoom();
  }

  private leaveCurrentRoom(): void {
    if (!this.currentRoomId) return;

    try {
      const { room, shouldDeleteRoom } = RoomService.leaveRoom(this.currentRoomId, this.currentPlayerId);
      
      if (shouldDeleteRoom) {
        Logger.info(`Room deleted after player left`, { roomId: this.currentRoomId });
      } else if (room) {
        this.socket.to(this.currentRoomId).emit('player-left', this.currentPlayerId);
        this.socket.to(this.currentRoomId).emit('room-updated', RoomService.serializeRoom(room));
        Logger.info(`Player left room`, { 
          roomId: this.currentRoomId, 
          playerId: this.currentPlayerId 
        });
      }
      
      this.socket.leave(this.currentRoomId);
      this.currentRoomId = null;
    } catch (error) {
      Logger.error('Failed to handle leave room', error);
    }
  }
}
