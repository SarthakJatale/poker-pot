# Poker Pot Calculator

A real-time multiplayer poker pot calculator built with TypeScript, React, and Node.js. This application focuses on tracking player balances, bets, and pot management without actual card dealing.

## Features

### Core Functionality
- **Real-time multiplayer**: Up to 8 players per room
- **Balance tracking**: Automatic pot and balance calculations
- **Betting system**: Support for Seen/Blind play styles
- **Dealer rotation**: Automatic dealer assignment after each round
- **Host controls**: Room settings and balance management

### Game Mechanics
- **Small/Big Blind**: Automatic blind posting
- **Action Options**: Fold, Call, Check, Raise, Seen, Blind
- **Round Progression**: Preflop → Flop → Turn → River → Showdown
- **Pot Management**: Automatic pot calculations and distribution

### Host Features
- Create and configure rooms
- Set initial balances and bet amounts
- Adjust player balances (with player confirmation)
- Control game settings
- Start/stop games

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Socket.IO Client** for real-time communication
- **CSS3** with modern responsive design

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST API endpoints
- **Socket.IO** for real-time WebSocket communication
- **In-memory data storage** (can be extended to use databases)

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poker-pot-calculator
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### Production Build

1. **Build the backend**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

## Usage

### Creating a Room
1. Enter your username and select an avatar
2. Configure room settings:
   - Initial balance for all players
   - Initial bet amount
   - Maximum number of players
3. Click "Create Room" to generate a 6-character room code

### Joining a Room
1. Enter your username and select an avatar
2. Enter the 6-character room code
3. Click "Join Room"

### Playing the Game
1. **Host starts the game** when ready (minimum 2 players)
2. **Dealer posts small blind**, next player posts big blind
3. **Players take turns** with available actions:
   - **Fold**: Exit the current round
   - **Seen**: View cards and bet double the minimum
   - **Blind**: Bet without viewing cards
   - **Call**: Match the current bet
   - **Check**: Pass if no bet to call
   - **Raise**: Increase the bet (in multiples of initial amount)
4. **Round progression**: Cards are revealed after each betting round
5. **Round ends**: Pot is distributed, dealer rotates

### Host Controls
- **Update Settings**: Modify room configuration (only when game is stopped)
- **Update Balances**: Adjust player balances (requires player confirmation)
- **Start Game**: Begin a new round when ready

## API Endpoints

### REST API
- `GET /health` - Health check endpoint
- `GET /api/rooms/:roomId` - Get room information

### Socket.IO Events

#### Client to Server
- `create-room` - Create a new room
- `join-room` - Join an existing room
- `leave-room` - Leave the current room
- `start-game` - Start a new game (host only)
- `player-action` - Submit a game action
- `update-balance` - Update player balance (host only)
- `update-settings` - Update room settings (host only)

#### Server to Client
- `room-created` - Room creation confirmation
- `room-joined` - Room join confirmation
- `room-updated` - Room state update
- `game-started` - Game start notification
- `game-updated` - Game state update
- `player-joined` - New player joined
- `player-left` - Player left the room
- `balance-updated` - Balance change notification
- `error` - Error message

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.tsx
│   │   │   ├── GameRoom.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── GameControls.tsx
│   │   │   └── HostControls.tsx
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts
│   │   ├── controllers/
│   │   │   ├── index.ts
│   │   │   └── socketController.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── index.ts
│   │   ├── models/
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   ├── api.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── gameService.ts
│   │   │   ├── index.ts
│   │   │   └── roomService.ts
│   │   ├── utils/
│   │   │   ├── index.ts
│   │   │   └── ToastResponseHandler.ts
│   │   ├── validators/
│   │   │   └── index.ts
│   │   ├── types.ts
│   │   └── server.ts
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Quality

- **TypeScript**: Strict typing enforced
- **Error Handling**: Comprehensive error handling on both client and server
- **Validation**: Input validation for all user actions
- **Security**: Room access control and action authorization
- **Performance**: Efficient state management and minimal re-renders

## Future Enhancements

- [ ] Database integration for persistent rooms
- [ ] User authentication system
- [ ] Game history and statistics
- [ ] Tournament mode
- [ ] Mobile app (React Native)
- [ ] Voice chat integration
- [ ] Spectator mode
- [ ] Custom game rules

## License

This project is licensed under the ISC License - see the package.json files for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
