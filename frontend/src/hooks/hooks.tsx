import {useQuery} from '@tanstack/react-query';
import fetchRoom from '../api/api.tsx'
import {RoomListDTO} from "../types/roomInfo.tsx";

export const useRoomList = () => {
    return useQuery<RoomListDTO, Error>({
        queryKey: ['roomList'],
        queryFn: fetchRoom,
        initialData: {
            privateroom: [],
            publicroom: []
        }
    });
};
