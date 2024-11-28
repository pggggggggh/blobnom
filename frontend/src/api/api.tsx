import {api} from "./instance.tsx";
import {RoomDetail} from "../types/RoomDetail.tsx";
import {RoomSummary} from "../types/RoomSummary.tsx";

export const fetchRoomList = async (): Promise<RoomSummary[]> => {
    const response = await api.get('/');
    console.log(response)
    return response.data;
};

export const fetchRoomDetail = async (roomId: number): Promise<RoomDetail> => {
    const response = await api.get(`/rooms/detail/${roomId}`);
    console.log(response)
    return response.data;
};
