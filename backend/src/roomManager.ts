import { Room, Player, RoomSettings } from './types';
import { GameLogic } from './gameLogic';

export class RoomManager {
  private static rooms = new Map<string, Room>();

  static createRoom(hostId: string, username: string, avatar: string, settings: RoomSettings): Room {
    const roomId = this.generateRoomId();
    
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
      gameState: GameLogic.createInitialGameState(settings.initialBetAmount),
      settings: {
        ...settings,
        maxPlayers: Math.max(2, Math.min(8, settings.maxPlayers || 6)), // Ensure 2-8 players
      },
    };

    this.rooms.set(roomId, room);
    return room;
  }

  static joinRoom(roomId: string, playerId: string, username: string, avatar: string): { room: Room; error?: string } {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { room: {} as Room, error: 'Room not found' };
    }

    if (room.players.has(playerId)) {
      // Player is reconnecting
      const player = room.players.get(playerId)!;
      player.isConnected = true;
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
    return { room };
  }

  static leaveRoom(roomId: string, playerId: string): { room?: Room; shouldDeleteRoom: boolean } {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { shouldDeleteRoom: false };
    }

    const player = room.players.get(playerId);
    if (player) {
      player.isConnected = false;
    }

    // If host leaves, transfer host to another player or delete room
    if (playerId === room.hostId) {
      const connectedPlayers = Array.from(room.players.values()).filter(p => p.isConnected && p.id !== playerId);
      
      if (connectedPlayers.length === 0) {
        this.rooms.delete(roomId);
        return { shouldDeleteRoom: true };
      }
      
      // Transfer host to first connected player
      room.hostId = connectedPlayers[0].id;
    }

    // If no connected players, delete room
    const hasConnectedPlayers = Array.from(room.players.values()).some(p => p.isConnected);
    if (!hasConnectedPlayers) {
      this.rooms.delete(roomId);
      return { shouldDeleteRoom: true };
    }

    return { room, shouldDeleteRoom: false };
  }

  static getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  static getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  static deleteRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  private static generateRoomId(): string {
    // Generate a 6-character room ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.rooms.has(result)) {
      return this.generateRoomId();
    }
    
    return result;
  }

  static validateRoomSettings(settings: RoomSettings): string | null {
    if (settings.initialBalance <= 0) {
      return 'Initial balance must be positive';
    }
    
    if (settings.initialBetAmount <= 0) {
      return 'Initial bet amount must be positive';
    }
    
    if (settings.initialBetAmount >= settings.initialBalance) {
      return 'Initial bet amount must be less than initial balance';
    }
    
    if (settings.maxPlayers < 2 || settings.maxPlayers > 8) {
      return 'Max players must be between 2 and 8';
    }
    
    return null;
  }

  static serializeRoom(room: Room): any {
    return {
      ...room,
      players: Array.from(room.players.entries()).map(([_, player]) => player),
    };
  }

  static deserializeRoom(data: any): Room {
    const room = { ...data } as Room;
    room.players = new Map(data.players.map((p: any) => [p.id, p]));
    return room;
  }
}
