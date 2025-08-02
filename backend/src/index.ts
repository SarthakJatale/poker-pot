import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './roomManager';
import { GameLogic } from './gameLogic';
import { SocketEventMap, PlayerAction } from './types';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server<SocketEventMap, SocketEventMap>(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get room info endpoint
app.get('/api/rooms/:roomId', (req, res) => {
  try {
    const room = RoomManager.getRoom(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(RoomManager.serializeRoom(room));
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  let currentRoomId: string | null = null;
  let currentPlayerId: string = socket.id;

  // Create room
  socket.on('create-room', (data) => {
    try {
      const validationError = RoomManager.validateRoomSettings(data.settings);
      if (validationError) {
        socket.emit('error', validationError);
        return;
      }

      const room = RoomManager.createRoom(currentPlayerId, data.username, data.avatar, data.settings);
      currentRoomId = room.id;
      
      socket.join(room.id);
      socket.emit('room-created', { roomId: room.id, room: RoomManager.serializeRoom(room) });
      
      console.log(`Room created: ${room.id} by ${data.username}`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', 'Failed to create room');
    }
  });

  // Join room
  socket.on('join-room', (data) => {
    try {
      const { room, error } = RoomManager.joinRoom(data.roomId, currentPlayerId, data.username, data.avatar);
      
      if (error) {
        socket.emit('error', error);
        return;
      }

      currentRoomId = data.roomId;
      socket.join(data.roomId);
      
      // Notify all players in the room
      socket.to(data.roomId).emit('player-joined', room.players.get(currentPlayerId)!);
      socket.emit('room-joined', { room: RoomManager.serializeRoom(room), playerId: currentPlayerId });
      socket.to(data.roomId).emit('room-updated', RoomManager.serializeRoom(room));
      
      console.log(`${data.username} joined room: ${data.roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  // Leave room
  socket.on('leave-room', () => {
    handleLeaveRoom();
  });

  // Start game
  socket.on('start-game', () => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const room = RoomManager.getRoom(currentRoomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== currentPlayerId) {
        socket.emit('error', 'Only the host can start the game');
        return;
      }

      const gameState = GameLogic.startGame(room);
      io.to(currentRoomId).emit('game-started', gameState);
      io.to(currentRoomId).emit('room-updated', RoomManager.serializeRoom(room));
      
      console.log(`Game started in room: ${currentRoomId}`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', error instanceof Error ? error.message : 'Failed to start game');
    }
  });

  // Player action
  socket.on('player-action', (actionData) => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const room = RoomManager.getRoom(currentRoomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      const action: PlayerAction = {
        ...actionData,
        playerId: currentPlayerId,
        timestamp: Date.now(),
      };

      const { gameState, error } = GameLogic.processPlayerAction(room, action);
      
      if (error) {
        socket.emit('error', error);
        return;
      }

      io.to(currentRoomId).emit('game-updated', gameState);
      io.to(currentRoomId).emit('room-updated', RoomManager.serializeRoom(room));
      
      console.log(`Player action in room ${currentRoomId}:`, action);
    } catch (error) {
      console.error('Error processing player action:', error);
      socket.emit('error', 'Failed to process action');
    }
  });

  // Update player balance
  socket.on('update-balance', (data) => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const room = RoomManager.getRoom(currentRoomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== currentPlayerId) {
        socket.emit('error', 'Only the host can update balances');
        return;
      }

      if (room.gameState.isGameInProgress) {
        socket.emit('error', 'Cannot update balance during an active game');
        return;
      }

      // Send balance update request to the target player
      const targetPlayer = room.players.get(data.playerId);
      if (!targetPlayer) {
        socket.emit('error', 'Player not found');
        return;
      }

      // For this implementation, we'll auto-approve balance updates
      // In a real app, you might want player confirmation
      const success = GameLogic.updatePlayerBalance(room, data.playerId, data.newBalance);
      
      if (success) {
        io.to(currentRoomId).emit('balance-updated', { 
          playerId: data.playerId, 
          newBalance: data.newBalance 
        });
        io.to(currentRoomId).emit('room-updated', RoomManager.serializeRoom(room));
        console.log(`Balance updated for player ${data.playerId}: ${data.newBalance}`);
      } else {
        socket.emit('error', 'Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      socket.emit('error', 'Failed to update balance');
    }
  });

  // Update room settings
  socket.on('update-settings', (settings) => {
    try {
      if (!currentRoomId) {
        socket.emit('error', 'Not in a room');
        return;
      }

      const room = RoomManager.getRoom(currentRoomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.hostId !== currentPlayerId) {
        socket.emit('error', 'Only the host can update settings');
        return;
      }

      GameLogic.updateRoomSettings(room, settings);
      io.to(currentRoomId).emit('room-updated', RoomManager.serializeRoom(room));
      
      console.log(`Settings updated in room ${currentRoomId}:`, settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      socket.emit('error', error instanceof Error ? error.message : 'Failed to update settings');
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    handleLeaveRoom();
  });

  function handleLeaveRoom() {
    if (!currentRoomId) return;

    try {
      const { room, shouldDeleteRoom } = RoomManager.leaveRoom(currentRoomId, currentPlayerId);
      
      if (shouldDeleteRoom) {
        console.log(`Room deleted: ${currentRoomId}`);
      } else if (room) {
        socket.to(currentRoomId).emit('player-left', currentPlayerId);
        socket.to(currentRoomId).emit('room-updated', RoomManager.serializeRoom(room));
        console.log(`Player left room: ${currentRoomId}`);
      }
      
      socket.leave(currentRoomId);
      currentRoomId = null;
    } catch (error) {
      console.error('Error handling leave room:', error);
    }
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
});
