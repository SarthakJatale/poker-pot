import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate(ROUTES.HOME);
  };

  const goToCreateRoom = () => {
    navigate(ROUTES.CREATE_ROOM);
  };

  const goToJoinRoom = () => {
    navigate(ROUTES.JOIN_ROOM);
  };

  const goToRoom = (roomId: string) => {
    navigate(ROUTES.ROOM.replace(':roomId', roomId));
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    goHome,
    goToCreateRoom,
    goToJoinRoom,
    goToRoom,
    goBack,
    navigate,
  };
};
