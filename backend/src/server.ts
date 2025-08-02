import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import config from './config';
import { SocketEventMap } from './models';
import { SocketController } from './controllers';
import { apiRoutes } from './routes';
import { 
  errorHandler, 
  notFoundHandler, 
  requestLogger, 
  securityHeaders 
} from './middleware';
import { Logger } from './utils';
import { RoomService } from './services';

class PokerServer {
  private app: express.Application;
  private server: any;
  private io: Server<SocketEventMap, SocketEventMap>;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = this.setupSocketIO();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupCleanupTasks();
  }

  private setupSocketIO(): Server<SocketEventMap, SocketEventMap> {
    const io = new Server<SocketEventMap, SocketEventMap>(this.server, {
      cors: config.socket.cors
    });

    io.on('connection', (socket) => {
      Logger.info(`Socket connected`, { socketId: socket.id, totalConnections: io.engine.clientsCount });
      new SocketController(socket, io);
    });

    return io;
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(securityHeaders);

    // Request logging
    if (config.logging.enableConsole) {
      this.app.use(requestLogger);
    }

    // CORS configuration
    this.app.use(cors(config.cors));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api', apiRoutes);

    // Root health check
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Poker Pot Server',
        version: '2.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private setupCleanupTasks(): void {
    // Cleanup disconnected rooms every 5 minutes
    setInterval(() => {
      try {
        const cleanedRooms = RoomService.cleanupDisconnectedRooms();
        if (cleanedRooms > 0) {
          Logger.info(`Periodic cleanup completed`, { cleanedRooms });
        }
      } catch (error) {
        Logger.error('Error during periodic cleanup', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Log server stats every 10 minutes in development
    if (config.server.nodeEnv === 'development') {
      setInterval(() => {
        Logger.debug('Server stats', {
          rooms: RoomService.getRoomCount(),
          players: RoomService.getConnectedPlayersCount(),
          uptime: process.uptime(),
          memory: process.memoryUsage()
        });
      }, 10 * 60 * 1000); // 10 minutes
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = (signal: string) => {
      Logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      this.server.close(() => {
        Logger.info('HTTP server closed');
        
        this.io.close(() => {
          Logger.info('Socket.IO server closed');
          process.exit(0);
        });
      });

      // Force exit after 30 seconds
      setTimeout(() => {
        Logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught Exception', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled Rejection', { reason, promise });
      shutdown('UNHANDLED_REJECTION');
    });
  }

  public start(): void {
    this.setupGracefulShutdown();

    this.server.listen(config.server.port, () => {
      Logger.info(`🚀 Poker Pot Server started`, {
        port: config.server.port,
        environment: config.server.nodeEnv,
        timestamp: new Date().toISOString()
      });
      Logger.info(`📡 Socket.IO server ready for connections`);
      
      if (config.server.nodeEnv === 'development') {
        Logger.info(`🔗 Server running at http://localhost:${config.server.port}`);
        Logger.info(`🎮 Ready to accept poker game connections!`);
      }
    });
  }
}

// Start the server
const server = new PokerServer();
server.start();
