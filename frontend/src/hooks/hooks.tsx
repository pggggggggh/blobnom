import {useQuery} from '@tanstack/react-query';
import fetchRoom from '../api/api.tsx'
import {RoomInfoDTO} from "../types/roomInfo.tsx";

export const useRoomList = () => {
    return useQuery<RoomInfoDTO, Error>({
        queryKey: ['roomList'],
        queryFn: fetchRoom,
    });
};
