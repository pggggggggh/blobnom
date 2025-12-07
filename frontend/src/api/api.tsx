import { api } from "./instance.tsx";
import { RoomDetail } from "../types/RoomDetail.tsx";
import { MainData } from "../types/Summaries.tsx";
import { RoomForm } from "../types/RoomForm.tsx";
import { BindPayload, LoginPayload, PlatformTokenResponse, RegisterPayload, } from "../types/Auth.tsx"
import { ContestDetail } from "../types/ContestDetail.tsx";
import { MemberDetails } from "../types/MemberDetails.tsx";
import { SiteStats } from "../types/SiteStats.tsx";
import { Leaderboards } from "../types/Leaderboards.tsx";
import { PracticeRankData, PracticeSetSummary } from "../types/PracticeSet.tsx";
import { PracticeRankData } from "../types/PracticeRankData.tsx";
import { ActiveUsersData } from "../types/ActiveUsersData.tsx";
import { PracticeForm } from "../types/PracticeForm.tsx";
import {TokenInfo} from "../types/TokenInfo.ts";

export const fetchMainData = async (page: number, search: string, activeOnly: boolean, myRoomOnly: boolean): Promise<MainData> => {
    const response = await api.get(`/rooms/list`, {
        params: {
            page: page, search: search, activeOnly: activeOnly, myRoomOnly: myRoomOnly,
        }
    });
    return response.data;
};

export const fetchContestList = async (): Promise<ContestDetail[]> => {
    const response = await api.get(`/contests/list`);
    return response.data;
};

export const fetchPracticeList = async (): Promise<PracticeSetSummary[]> => {
    const response = await api.get(`/practices/list`);
    return response.data;
};

export const fetchRoomDetail = async (roomId: number): Promise<RoomDetail> => {
    const response = await api.get(`/rooms/details/${roomId}`);
    return response.data;
};

export const fetchContestDetail = async (contestId: number): Promise<ContestDetail> => {
    const response = await api.get(`/contests/detail/${contestId}`);
    return response.data;
};

export const fetchMemberDetails = async (handle: string): Promise<MemberDetails> => {
    const response = await api.get(`/members/details/${handle}`);
    return response.data;
};

export const fetchSiteStats = async (): Promise<SiteStats> => {
    const response = await api.get(`/stats`);
    return response.data;
};

export const fetchActiveUsers = async (): Promise<ActiveUsersData> => {
    const response = await api.get(`/active-users`);
    return response.data;
};
export const fetchLeaderboards = async (): Promise<Leaderboards> => {
    const response = await api.get(`/leaderboards`);
    return response.data;
};

export const fetchPracticeRank = async (practiceId: number): Promise<PracticeRankData> => {
    const response = await api.get(`/practices/${practiceId}/rank`);
    return response.data;
};

export const postSolveProblem = async (data: { roomId: number; problemId: number }) => {
    const response = await api.post(`/rooms/solved`, { room_id: data.roomId, problem_id: data.problemId });
    return response.data;
}

export const postJoinRoom = async (data: { roomId: number; password: string | null; }) => {
    let response;
    if (data.password != null) {
        response = await api.post(`/rooms/join/${data.roomId}`, { password: data.password });
    } else {
        response = await api.post(`/rooms/join/${data.roomId}`);
    }
    return response.data;
}
export const postRegisterContest = async (data: { contestId: number }) => {
    const response = await api.post(`/contests/register/${data.contestId}`);
    return response.data;
}

export const postPracticeEligible = async (data: { practiceId: number }) => {
    const response = await api.post(`/practices/${data.practiceId}/eligible`);
    return response.data;
}

export const postPracticeStart = async (data: { practiceId: number, startTime: Date }) => {
    const response = await api.post(`/practices/${data.practiceId}/start`, { start_time: data.startTime });
    return response.data;
}

export const postCreatePractice = async (data: PracticeForm) => {
    console.log(data)
    const response = await api.post(`/practices/create`, data);
    return response.data;
}

export const deletePractice = async (data: { practiceId: number; }) => {
    const response = await api.delete(`/practices/${data.practiceId}`);
    return response.data;
};

export const postUnregisterContest = async (data: { contestId: number }) => {
    const response = await api.post(`/contests/unregister/${data.contestId}`);
    return response.data;
}

export const postCreateRoom = async (data: RoomForm) => {
    console.log(data)
    const response = await api.post(`/rooms/create`, data);
    return response.data;
}

export const deleteRoom = async (data: { roomId: number; password: string }) => {
    const response = await api.post(`/rooms/delete/${data.roomId}`, { password: data.password });
    return response.data;
};


export const postLogin = async(data: LoginPayload) => {
    const response = await api.post('/auth/login', data);
    return response.data;
}

export async function fetchPlatformToken(): Promise<PlatformTokenResponse> {
    const response = await api.get<PlatformTokenResponse>('/auth/solvedac_token');
    return response.data;
}

export async function postRegister(payload: RegisterPayload): Promise<{ result: 'success' }> {
    const response = await api.post<{ result: 'success' }>('/auth/register', payload);
    return response.data;
}

export async function postBindAccount(payload: BindPayload): Promise<{ result: 'success' }> {
    const response = await api.post<{ result: 'success' }>('/auth/bind', payload);
    return response.data;
}