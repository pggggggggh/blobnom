import { api } from "./instance.tsx";
import { RoomDetail } from "../types/RoomDetail.tsx";
import { MainData } from "../types/RoomSummary.tsx";
import { RoomForm } from "../types/RoomForm.tsx";
import {
    LoginPayload,
    RegisterPayload,
    SolvedAcTokenResponse,
} from "../types/Auth.tsx"

export const fetchMainData = async (page: number, search: string, activeOnly: boolean): Promise<MainData> => {
    const response = await api.get(`/`, {
        params: {
            page: page, search: search, activeOnly: activeOnly,
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
    const response = await api.post(`/rooms/solved/`, { room_id: data.roomId, problem_id: data.problemId });
    console.log(response)
    return response.data;
}

export const postJoinRoom = async (data: { roomId: number; handle: string; password: string; }) => {
    const response = await api.post(`/rooms/join/${data.roomId}`, { handle: data.handle, password: data.password });
    console.log(response)
    return response.data;
}

export const postCreateRoom = async (data: RoomForm) => {
    const response = await api.post(`/rooms/create`, data);
    console.log(response)
    return response.data;
}

export const deleteRoom = async (data: { roomId: number; password: string }) => {
    const response = await api.post(`/rooms/delete/${data.roomId}`, { roomId: data.roomId, password: data.password });
    console.log(response)
    return response.data;
};


export async function postLogin(
    payload: LoginPayload
): Promise<{ result: 'success'; token: string }> {
    const response = await api.post<{ result: 'success'; token: string }>('/auth/login', payload);
    return response.data;
}

export async function fetchSolvedAcToken(): Promise<SolvedAcTokenResponse> {
    const response = await api.get<SolvedAcTokenResponse>('/auth/solvedac_token');
    return response.data;
}

export async function postRegister(payload: RegisterPayload): Promise<{ result: 'success' }> {
    const response = await api.post<{ result: 'success' }>('/auth/register', payload);
    return response.data;
}