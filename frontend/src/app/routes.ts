export const ROUTES = {
  HOME: '/',
  CREATE_ROOM: '/create-room',
  JOIN_ROOM: '/join-room',
  ROOM: '/room/:roomId',
} as const;

export type RouteParams = {
  roomId: string;
};
