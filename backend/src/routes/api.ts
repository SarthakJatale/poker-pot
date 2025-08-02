import { Router, Request, Response } from 'express';
import { RoomService } from '../services';
import { asyncHandler } from '../middleware/errorHandler';
import { Logger } from '../utils';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get room info endpoint
router.get('/rooms/:roomId', asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  
  const room = RoomService.getRoom(roomId);
  if (!room) {
    return res.status(404).json({ 
      error: 'Room not found',
      roomId 
    });
  }

  Logger.info(`Room info requested`, { roomId, requestIp: req.ip });
  res.json({
    success: true,
    data: RoomService.serializeRoom(room)
  });
}));

// Get server stats endpoint (for monitoring)
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = {
    totalRooms: RoomService.getRoomCount(),
    totalConnectedPlayers: RoomService.getConnectedPlayersCount(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  };

  Logger.debug(`Server stats requested`, { requestIp: req.ip });
  res.json({
    success: true,
    data: stats
  });
}));

// Clean up disconnected rooms (admin endpoint)
router.post('/admin/cleanup', asyncHandler(async (req: Request, res: Response) => {
  const cleanedRooms = RoomService.cleanupDisconnectedRooms();
  
  Logger.info(`Manual cleanup performed`, { cleanedRooms, requestIp: req.ip });
  res.json({
    success: true,
    message: `Cleaned up ${cleanedRooms} empty rooms`,
    cleanedRooms
  });
}));

export default router;
