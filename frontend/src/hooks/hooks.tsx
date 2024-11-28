import {useQuery} from '@tanstack/react-query';
import {RoomDetail} from "../types/RoomDetail.tsx";
import {fetchRoomDetail, fetchRoomList} from "../api/api.tsx";
import {RoomSummary} from "../types/RoomSummary.tsx";

export const useRoomList = () => {
    return useQuery<RoomSummary[], Error>({
        queryKey: ['roomList'],
        queryFn: fetchRoomList,
        initialData: []
    });
};

export const useRoomDetail = (roomId: number) => {
    return useQuery<RoomDetail, Error>({
        queryKey: ['roomDetail', roomId],
        queryFn: () => fetchRoomDetail(roomId),
    });
};
