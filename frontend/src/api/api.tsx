import {api} from "./instance.tsx";
import {RoomDetail} from "../types/RoomDetail.tsx";
import {MainData} from "../types/Summaries.tsx";
import {RoomForm} from "../types/RoomForm.tsx";
import {LoginPayload, RegisterPayload, SolvedAcTokenResponse,} from "../types/Auth.tsx"
import {ContestDetail} from "../types/ContestDetail.tsx";
import {MemberDetails} from "../types/MemberDetails.tsx";

export const fetchMainData = async (page: number, search: string, activeOnly: boolean, myRoomOnly: boolean): Promise<MainData> => {
    const response = await api.get(`/rooms/list`, {
        params: {
            page: page, search: search, activeOnly: activeOnly, myRoomOnly: myRoomOnly,
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

export const fetchContestDetail = async (contestId: number): Promise<ContestDetail> => {
    const response = await api.get(`/contests/detail/${contestId}`);
    console.log(response)
    return response.data;
};

export const fetchMemberDetails = async (handle: string): Promise<MemberDetails> => {
    const response = await api.get(`/members/details/${handle}`);
    console.log(response)
    return response.data;
};

export const postSolveProblem = async (data: { roomId: number; problemId: number }) => {
    const response = await api.post(`/rooms/solved`, {room_id: data.roomId, problem_id: data.problemId});
    console.log(response)
    return response.data;
}

export const postJoinRoom = async (data: { roomId: number; handle: string; password: string; }) => {
    const response = await api.post(`/rooms/join/${data.roomId}`, {handle: data.handle, password: data.password});
    console.log(response)
    return response.data;
}
export const postRegisterContest = async (data: { contestId: number }) => {
    const response = await api.post(`/contests/register/${data.contestId}`);
    console.log(response)
    return response.data;
}

export const postUnregisterContest = async (data: { contestId: number }) => {
    const response = await api.post(`/contests/unregister/${data.contestId}`);
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