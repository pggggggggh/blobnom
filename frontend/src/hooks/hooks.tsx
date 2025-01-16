import {useMutation, useQuery} from '@tanstack/react-query';
import {RoomDetail} from "../types/RoomDetail.tsx";
import {LoginPayload, RegisterPayload, SolvedAcTokenResponse,} from "../types/Auth.tsx"
import {
    deleteRoom,
    fetchContestDetail,
    fetchMainData,
    fetchRoomDetail,
    fetchSolvedAcToken,
    postCreateRoom,
    postJoinRoom,
    postLogin,
    postRegister,
    postRegisterContest,
    postSolveProblem,
    postUnregisterContest
} from "../api/api.tsx";
import {modals} from "@mantine/modals";
import ErrorModal from "../components/Modals/ErrorModal.tsx";
import {MainData} from "../types/Summaries.tsx";
import {useRouter} from "@tanstack/react-router";
import {ContestDetail} from "../types/ContestDetail.tsx";


export const useRoomList = (page: number, search: string, activeOnly: boolean) => {
    return useQuery<MainData, Error>({
        queryKey: ['roomList', page, search, activeOnly],
        queryFn: () => fetchMainData(page, search, activeOnly),
    });
};


export const useRoomDetail = (roomId: number) => {
    return useQuery<RoomDetail, Error>({
        queryKey: ['roomDetail', roomId],
        queryFn: () => fetchRoomDetail(roomId),
    });
};

export const useContestDetail = (contestId: number) => {
    return useQuery<ContestDetail, Error>({
        queryKey: ['contestDetail', contestId],
        queryFn: () => fetchContestDetail(contestId),
    });
};


export const useSolveProblem = () => {
    return useMutation({
        mutationFn: postSolveProblem,
        onSuccess: () => {
        },
        onError: (error) => {
            console.log(error);
            modals.open({
                children: (
                    <ErrorModal detailMessage={"문제를 해결하는 중 오류가 발생했습니다."}/>
                ),
            });
        },
    });
};


export const useJoinRoom = () => {
    return useMutation({
        mutationFn: postJoinRoom,
        onSuccess: () => {
            window.location.reload();
        },
        onError: (error: any) => {
            console.log(error);
            const detailMessage =
                error?.response?.data?.detail || "알 수 없는 에러가 발생했습니다.";
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        },
    });
};

export const useRegisterContest = () => {
    return useMutation({
        mutationFn: postRegisterContest,
        onSuccess: () => {
            window.location.reload();
        },
        onError: (error: any) => {
            console.log(error);
            const detailMessage =
                error?.response?.data?.detail || "알 수 없는 에러가 발생했습니다.";
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        },
    });
}

export const useUnregisterContest = () => {
    return useMutation({
        mutationFn: postUnregisterContest,
        onSuccess: () => {
            window.location.reload();
        },
        onError: (error: any) => {
            console.log(error);
            const detailMessage =
                error?.response?.data?.detail || "알 수 없는 에러가 발생했습니다.";
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        },
    });
}

export const useCreateRoom = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: postCreateRoom,
        onSuccess: (data) => {
            const roomId = data?.roomId;
            if (roomId) {
                router.navigate({
                    to: '/rooms/$roomId',
                    params: {roomId: roomId},
                });
            } else {
                modals.open({
                    children: <ErrorModal detailMessage="알 수 없는 에러가 발생했습니다."/>,
                });
            }
        },
        onError: (error: any) => {
            console.log(error);
            const detailMessage =
                error?.response?.data?.detail || "알 수 없는 에러가 발생했습니다.";
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        },
    });
};


export const useDeleteRoom = () => {
    return useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            window.location.href = "/";
        },
        onError: (error: any) => {
            console.log(error);
            const detailMessage =
                error?.response?.data?.detail || "알 수 없는 에러가 발생했습니다.";
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        },
    });
};


export const useFetchSolvedAcToken = () => {
    return useQuery<SolvedAcTokenResponse, Error>({
        queryKey: ['solvedAcToken'],
        queryFn: fetchSolvedAcToken,
        enabled: false,
    });
};


export const useRegister = () => {
    return useMutation({
        mutationFn: (payload: RegisterPayload) => postRegister(payload),
        onSuccess: () => {
            modals.open({
                children: (
                    <ErrorModal detailMessage="회원가입이 완료되었습니다. 로그인 해주세요."/>
                ),
            });
        },
        onError: (error: any) => {
            console.log(error);
            let detailMessage = "회원가입 중 오류가 발생했습니다.";
            if (error?.response) {
                if (error.response.status === 409) {
                    detailMessage = "이미 사용 중인 핸들이나 이메일입니다.";
                } else if (error.response.status === 400) {
                    detailMessage = "토큰 검증에 실패했습니다. (solved.ac 토큰 확인)";
                } else if (error.response.status === 404) {
                    detailMessage = "User not found (solved.ac)";
                }
            }
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        },
    });
};


export const useLogin = () => {
    return useMutation({
        mutationFn: (payload: LoginPayload) => postLogin(payload),
        onSuccess: (data) => {
            localStorage.setItem('accessToken', data.token);
            window.location.href = "/";
        },
        onError: (error: any) => {
            console.log(error);
            let detailMessage = "로그인 중 오류가 발생했습니다.";
            if (error?.response) {
                if (error.response.status === 404) {
                    detailMessage = "존재하지 않는 사용자입니다.";
                } else if (error.response.status === 401) {
                    detailMessage = "비밀번호가 잘못되었습니다.";
                }
            }
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        },
    });
};