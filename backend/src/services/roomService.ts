import { Room, Player, RoomSettings, SerializedRoom } from '../models';
import { GameService } from './gameService';
import { Logger, ensureUniqueRoomId } from '../utils';

export class RoomService {
  private static rooms = new Map<string, Room>();

  static createRoom(hostId: string, username: string, avatar: string, settings: RoomSettings): Room {
    try {
      const roomId = ensureUniqueRoomId(new Set(this.rooms.keys()));
      
      const host: Player = {
        id: hostId,
        username,
        avatar,
        balance: settings.initialBalance,
        isDealer: false,
        hasSeenCards: false,
        currentBet: 0,
        hasFolded: false,
        isConnected: true,
      };

      const room: Room = {
        id: roomId,
        hostId,
        players: new Map([[hostId, host]]),
        gameState: GameService.createInitialGameState(settings.initialBetAmount),
        settings: {
          ...settings,
          maxPlayers: Math.max(2, Math.min(8, settings.maxPlayers || 6)),
        },
      };

      this.rooms.set(roomId, room);
      Logger.info(`Room created: ${roomId}`, { hostId, username, playersCount: 1 });
      
      return room;
    } catch (error) {
      Logger.error('Failed to create room', error);
      throw error;
    }
  }

  static joinRoom(roomId: string, playerId: string, username: string, avatar: string): { room: Room; error?: string } {
    try {
      const room = this.rooms.get(roomId);
      
      if (!room) {
        return { room: {} as Room, error: 'Room not found' };
      }

      if (room.players.has(playerId)) {
        // Player is reconnecting
        const player = room.players.get(playerId)!;
        player.isConnected = true;
        Logger.info(`Player reconnected to room: ${roomId}`, { playerId, username });
        return { room };
      }

      if (room.players.size >= room.settings.maxPlayers) {
        return { room, error: 'Room is full' };
      }

      if (room.gameState.isGameInProgress) {
        return { room, error: 'Game is already in progress' };
      }

      const newPlayer: Player = {
        id: playerId,
        username,
        avatar,
        balance: room.settings.initialBalance,
        isDealer: false,
        hasSeenCards: false,
        currentBet: 0,
        hasFolded: false,
        isConnected: true,
      };

      room.players.set(playerId, newPlayer);
      Logger.info(`Player joined room: ${roomId}`, { playerId, username, playersCount: room.players.size });
      
      return { room };
    } catch (error) {
      Logger.error('Failed to join room', error);
      return { room: {} as Room, error: 'Failed to join room' };
    }
  }

  static leaveRoom(roomId: string, playerId: string): { room?: Room; shouldDeleteRoom: boolean } {
    try {
      const room = this.rooms.get(roomId);
      
      if (!room) {
        return { shouldDeleteRoom: false };
      }

      const player = room.players.get(playerId);
      if (player) {
        player.isConnected = false;
        Logger.info(`Player left room: ${roomId}`, { playerId, username: player.username });
      }

      // If host leaves, transfer host to another player or delete room
      if (playerId === room.hostId) {
        const connectedPlayers = Array.from(room.players.values())
          .filter(p => p.isConnected && p.id !== playerId);
        
        if (connectedPlayers.length === 0) {
          this.rooms.delete(roomId);
          Logger.info(`Room deleted (host left, no connected players): ${roomId}`);
          return { shouldDeleteRoom: true };
        }
        
        // Transfer host to first connected player
        room.hostId = connectedPlayers[0].id;
        Logger.info(`Host transferred in room: ${roomId}`, { 
          oldHostId: playerId, 
          newHostId: room.hostId 
        });
      }

      // If no connected players, delete room
      const hasConnectedPlayers = Array.from(room.players.values()).some(p => p.isConnected);
      if (!hasConnectedPlayers) {
        this.rooms.delete(roomId);
        Logger.info(`Room deleted (no connected players): ${roomId}`);
        return { shouldDeleteRoom: true };
      }

      return { room, shouldDeleteRoom: false };
    } catch (error) {
      Logger.error('Failed to handle leave room', error);
      return { shouldDeleteRoom: false };
    }
  }

  static getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  static getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  static deleteRoom(roomId: string): boolean {
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      Logger.info(`Room deleted: ${roomId}`);
    }
    return deleted;
  }

  static getRoomCount(): number {
    return this.rooms.size;
  }

  static getConnectedPlayersCount(): number {
    let count = 0;
    for (const room of this.rooms.values()) {
      count += Array.from(room.players.values()).filter(p => p.isConnected).length;
    }
    return count;
  }

  static serializeRoom(room: Room): SerializedRoom {
    return {
      ...room,
      players: Array.from(room.players.entries()).map(([_, player]) => player),
    };
  }

  static deserializeRoom(data: SerializedRoom): Room {
    const room = { 
      ...data, 
      players: new Map(data.players.map((p: Player) => [p.id, p])) 
    } as Room;
    return room;
  }

  // Cleanup methods for maintenance
  static cleanupDisconnectedRooms(): number {
    let cleanedRooms = 0;
    const roomsToDelete: string[] = [];

    for (const [roomId, room] of this.rooms.entries()) {
      const connectedPlayers = Array.from(room.players.values()).filter(p => p.isConnected);
      if (connectedPlayers.length === 0) {
        roomsToDelete.push(roomId);
      }
    }

    roomsToDelete.forEach(roomId => {
      this.rooms.delete(roomId);
      cleanedRooms++;
    });

    if (cleanedRooms > 0) {
      Logger.info(`Cleaned up ${cleanedRooms} empty rooms`);
    }

    return cleanedRooms;
  }
}
