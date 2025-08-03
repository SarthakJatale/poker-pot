# Frontend Architecture - Production-Level Structure

This document outlines the production-level folder structure and code splitting implementation for the Poker Pot Calculator frontend application.

## 📁 Folder Structure

```
src/
├── app/                    # Application configuration and setup
│   ├── providers/         # App-level providers (Router, etc.)
│   └── store/            # Global state management (future)
├── features/             # Feature-based modules
│   ├── home/            # Home page feature
│   │   ├── components/  # Home-specific components
│   │   └── HomePage.tsx # Main home page component
│   └── game/            # Game room feature
│       ├── components/  # Game-specific components
│       └── GameRoom.tsx # Main game room component
├── shared/              # Shared utilities and components
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API and external services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── constants/      # Application constants
└── assets/             # Static assets
```

## 🚀 Key Features

### 1. **Code Splitting**
- **Lazy Loading**: Components are loaded using `React.lazy()` for optimal bundle splitting
- **Route-based Splitting**: Features are split at the route level
- **Component-level Splitting**: Sub-components within features are also lazily loaded

### 2. **Feature-based Architecture**
- **Separation of Concerns**: Each feature is self-contained
- **Scalability**: Easy to add new features without affecting existing ones
- **Maintainability**: Clear boundaries between different parts of the application

### 3. **Shared Resources**
- **Reusable Components**: UI components that can be used across features
- **Custom Hooks**: Business logic abstracted into reusable hooks
- **Type Safety**: Centralized TypeScript types for consistency

### 4. **Performance Optimizations**
- **Bundle Splitting**: Vendor libraries are split into separate chunks
- **Tree Shaking**: Unused code is eliminated during build
- **Lazy Loading**: Components load only when needed

## 🛠 Technical Implementation

### Code Splitting Configuration

**Vite Configuration** (`vite.config.ts`):
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
        socket: ['socket.io-client'],
      },
    },
  },
}
```

### Lazy Loading Pattern

**App Component**:
```typescript
const HomePage = React.lazy(() => import('./features/home/HomePage'));
const GameRoom = React.lazy(() => import('./features/game/GameRoom'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HomePage />
</Suspense>
```

### Feature Structure Example

**Home Feature** (`src/features/home/`):
```
home/
├── HomePage.tsx           # Main feature component
├── index.ts              # Feature exports
└── components/
    ├── WelcomeScreen.tsx  # Lazy-loaded sub-component
    ├── CreateRoomForm.tsx # Lazy-loaded sub-component
    └── JoinRoomForm.tsx   # Lazy-loaded sub-component
```

## 📦 Dependencies

### Core Dependencies
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Client-side routing
- `socket.io-client` - Real-time communication

### Development Dependencies
- `typescript` - Type safety
- `vite` - Build tool with fast HMR
- `@vitejs/plugin-react` - React support for Vite

### New Dependencies Added
- `react-error-boundary` - Error handling
- `@types/node` - Node.js type definitions

## 🔧 Custom Hooks

### `useSocket`
Manages WebSocket connection with automatic cleanup:
```typescript
const { socket, isConnected, connect, disconnect } = useSocket();
```

### `useAppStore` (Zustand)
Centralized application state management with Zustand:
```typescript
const {
  room,
  currentPlayer,
  gameState,
  error,
  updateRoom,
  setError,
  clearError,
  reset
} = useAppStore();
```

## 🎨 Shared Components

### `ErrorBoundary`
Production-ready error handling with user-friendly fallbacks.

### `LoadingSpinner`
Customizable loading indicator with different sizes and messages.

## 🚦 Routing Strategy

- **Route-based Code Splitting**: Each major route loads its feature bundle
- **Nested Routes**: Support for complex routing patterns
- **Error Boundaries**: Route-level error handling
- **Lazy Loading**: Routes load only when accessed

## 📊 Bundle Analysis

The build process creates the following chunks:
- **vendor.js** - React and React DOM
- **router.js** - React Router
- **socket.js** - Socket.IO client
- **home.js** - Home feature
- **game.js** - Game feature
- **shared.js** - Shared utilities

## 🔮 Future Enhancements

1. **State Management**: Integration with Redux Toolkit or Zustand
2. **Testing**: Jest and React Testing Library setup
3. **PWA**: Progressive Web App capabilities
4. **Internationalization**: Multi-language support
5. **Accessibility**: WCAG compliance improvements
6. **Performance**: Web Vitals monitoring

## 🚀 Build Commands

```bash
# Development
npm run dev

# Production Build
npm run build

# Build Analysis
npm run build -- --analyze

# Preview Production Build
npm run preview
```

## 📈 Performance Benefits

1. **Faster Initial Load**: Only essential code loads initially
2. **Better Caching**: Vendor libraries cache separately
3. **Reduced Bundle Size**: Tree shaking eliminates unused code
4. **Progressive Loading**: Features load as needed
5. **Improved User Experience**: Loading states prevent jarring transitions

This architecture provides a solid foundation for scaling the application while maintaining excellent performance and developer experience.
