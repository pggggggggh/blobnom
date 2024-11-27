import {useQuery} from '@tanstack/react-query';
import fetchRoom from '../api/api.tsx'
import {RoomInfo} from "../types/roomInfo.tsx";

export const useRoomList = () => {
    return useQuery<RoomInfo[], Error>({
        queryKey: ['roomList'],
        queryFn: fetchRoom,
        initialData: []
    });
};
