import { Room, RoomSettings } from './types';
export declare class RoomManager {
    private static rooms;
    static createRoom(hostId: string, username: string, avatar: string, settings: RoomSettings): Room;
    static joinRoom(roomId: string, playerId: string, username: string, avatar: string): {
        room: Room;
        error?: string;
    };
    static leaveRoom(roomId: string, playerId: string): {
        room?: Room;
        shouldDeleteRoom: boolean;
    };
    static getRoom(roomId: string): Room | undefined;
    static getAllRooms(): Room[];
    static deleteRoom(roomId: string): boolean;
    private static generateRoomId;
    static validateRoomSettings(settings: RoomSettings): string | null;
    static serializeRoom(room: Room): any;
    static deserializeRoom(data: any): Room;
}
//# sourceMappingURL=roomManager.d.ts.map