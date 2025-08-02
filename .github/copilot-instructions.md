<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Poker Pot Calculator Project Instructions

This is a TypeScript-based poker pot calculator application with the following architecture:

## Project Structure
- `frontend/` - React + TypeScript frontend using Vite
- `backend/` - Node.js + TypeScript backend using Express and Socket.IO

## Key Technologies
- **Frontend**: React, TypeScript, Vite, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Real-time Communication**: Socket.IO for bidirectional event-based communication

## Code Style Guidelines
- Use TypeScript strict mode
- Prefer functional components with hooks in React
- Use proper error handling with try-catch blocks
- Follow camelCase naming convention
- Use interfaces for type definitions
- Implement proper socket event typing
- Use semantic CSS class names

## Business Logic
- This is a pot calculator, NOT a full poker game (no card dealing/evaluation)
- Focus on balance tracking, betting rounds, and pot management
- Support for Seen/Blind play styles typical in Indian poker variants
- Host controls for balance management and game settings
- Dealer rotation after each round

## Error Handling
- All socket events should have proper error handling
- Validate user inputs on both client and server
- Provide meaningful error messages to users
- Log errors on the server for debugging

## Security Considerations
- Validate all incoming socket data
- Only allow hosts to modify room settings and balances
- Ensure players can only act on their own turn
- Prevent unauthorized room access

## Performance
- Use React.memo for components that re-render frequently
- Debounce user inputs where appropriate
- Minimize socket event emissions
- Use efficient data structures for room and player management
