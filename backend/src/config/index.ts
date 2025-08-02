import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://pokerpot.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as string[],
  },

  // Socket.IO Configuration
  socket: {
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://pokerpot.vercel.app',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as string[],
      credentials: true,
    },
  },

  // Game Configuration
  game: {
    minPlayers: parseInt(process.env.MIN_PLAYERS || '2', 10),
    maxPlayers: parseInt(process.env.MAX_PLAYERS || '8', 10),
    defaultInitialBalance: parseInt(process.env.DEFAULT_INITIAL_BALANCE || '1000', 10),
    defaultInitialBet: parseInt(process.env.DEFAULT_INITIAL_BET || '10', 10),
    roomIdLength: parseInt(process.env.ROOM_ID_LENGTH || '6', 10),
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
  },
} as const;

export default config;
