"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const gameLogic_1 = require("./gameLogic");
class RoomManager {
    static createRoom(hostId, username, avatar, settings) {
        const roomId = this.generateRoomId();
        const host = {
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
        const room = {
            id: roomId,
            hostId,
            players: new Map([[hostId, host]]),
            gameState: gameLogic_1.GameLogic.createInitialGameState(settings.initialBetAmount),
            settings: {
                ...settings,
                maxPlayers: Math.max(2, Math.min(8, settings.maxPlayers || 6)), // Ensure 2-8 players
            },
        };
        this.rooms.set(roomId, room);
        return room;
    }
    static joinRoom(roomId, playerId, username, avatar) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return { room: {}, error: 'Room not found' };
        }
        if (room.players.has(playerId)) {
            // Player is reconnecting
            const player = room.players.get(playerId);
            player.isConnected = true;
            return { room };
        }
        if (room.players.size >= room.settings.maxPlayers) {
            return { room, error: 'Room is full' };
        }
        if (room.gameState.isGameInProgress) {
            return { room, error: 'Game is already in progress' };
        }
        const newPlayer = {
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
    static leaveRoom(roomId, playerId) {
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
    static getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    static getAllRooms() {
        return Array.from(this.rooms.values());
    }
    static deleteRoom(roomId) {
        return this.rooms.delete(roomId);
    }
    static generateRoomId() {
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
    static validateRoomSettings(settings) {
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
    static serializeRoom(room) {
        return {
            ...room,
            players: Array.from(room.players.entries()).map(([_, player]) => player),
        };
    }
    static deserializeRoom(data) {
        const room = { ...data };
        room.players = new Map(data.players.map((p) => [p.id, p]));
        return room;
    }
}
exports.RoomManager = RoomManager;
RoomManager.rooms = new Map();
//# sourceMappingURL=roomManager.js.map