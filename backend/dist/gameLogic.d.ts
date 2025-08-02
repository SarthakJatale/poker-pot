import { Room, GameState, PlayerAction, RoomSettings } from './types';
export declare class GameLogic {
    static createInitialGameState(initialBetAmount: number): GameState;
    static startGame(room: Room): GameState;
    static processPlayerAction(room: Room, action: PlayerAction): {
        gameState: GameState;
        error?: string;
    };
    private static checkIfBettingRoundComplete;
    private static advanceToNextPhase;
    private static endRound;
    static updatePlayerBalance(room: Room, playerId: string, newBalance: number): boolean;
    static updateRoomSettings(room: Room, settings: Partial<RoomSettings>): void;
}
//# sourceMappingURL=gameLogic.d.ts.map