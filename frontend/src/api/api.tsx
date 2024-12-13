import {api} from "./instance.tsx";
import {RoomDetail} from "../types/RoomDetail.tsx";
import {MainData} from "../types/RoomSummary.tsx";
import {RoomForm} from "../types/RoomForm.tsx";

export const fetchMainData = async (page: number, search: string): Promise<MainData> => {
    const response = await api.get(`/`, {
        params: {
            page: page, search: search
        }
    });
    console.log(response)
    return response.data;
};

export const fetchRoomDetail = async (roomId: number): Promise<RoomDetail> => {
    const response = await api.get(`/rooms/detail/${roomId}`);
    console.log(response)
    return response.data;
};

export const postSolveProblem = async (data: { roomId: number; problemId: number }) => {
    const response = await api.post(`/rooms/solved/`, {room_id: data.roomId, problem_id: data.problemId});
    console.log(response)
    return response.data;
}

export const postJoinRoom = async (data: { roomId: number; handle: string; password: string; }) => {
    const response = await api.post(`/rooms/join/${data.roomId}`, {handle: data.handle, password: data.password});
    console.log(response)
    return response.data;
}

export const postCreateRoom = async (data: RoomForm) => {
    const response = await api.post(`/rooms/create`, data);
    console.log(response)
    return response.data;
}

export const deleteRoom = async (data: { roomId: number; password: string }) => {
    const response = await api.post(`/rooms/delete/${data.roomId}`, {roomId: data.roomId, password: data.password});
    console.log(response)
    return response.data;
};