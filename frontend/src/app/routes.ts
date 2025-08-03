export const ROUTES = {
  HOME: '/',
  CREATE_ROOM: '/create-room',
  JOIN_ROOM: '/join-room',
  ROOM: '/room/:roomId',
  HELP: '/help',
} as const;

export type RouteParams = {
  roomId: string;
};
