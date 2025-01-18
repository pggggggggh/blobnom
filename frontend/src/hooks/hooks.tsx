import {useMutation, useQuery} from '@tanstack/react-query';
import {RoomDetail} from "../types/RoomDetail.tsx";
import {LoginPayload, RegisterPayload, SolvedAcTokenResponse,} from "../types/Auth.tsx"
import {
    deleteRoom,
    fetchMainData,
    fetchRoomDetail,
    fetchSolvedAcToken,
    postCreateRoom,
    postJoinRoom,
    postLogin,
    postRegister,
    postSolveProblem
} from "../api/api.tsx";
import {modals} from "@mantine/modals";
import ErrorModal from "../components/Modals/ErrorModal.tsx";
import {MainData} from "../types/RoomSummary.tsx";
import {useRouter} from "@tanstack/react-router";
import InfoModal from "../components/Modals/InfoModal.tsx";


const handleError = (error: any) => {
    console.log(error);
    let detailMessage = "알 수 없는 에러가 발생했습니다.";

    if (error?.response) {
        switch (error.response.status) {
            case 429:
                detailMessage = "잠시 후 시도해주세요.";
                break;
            // case 404:
            //     detailMessage = "존재하지 않는 리소스입니다.";
            //     break;
            case 401:
                detailMessage = "로그인해주시기 바랍니다.";
                break;
            // case 400:
            //     detailMessage = "잘못된 요청입니다.";
            //     break;
            default:
                detailMessage = error.response.data?.detail || detailMessage;
        }
    }

    modals.open({
        children: <ErrorModal detailMessage={detailMessage}/>,
    });
};


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


export const useSolveProblem = () => {
    return useMutation({
        mutationFn: postSolveProblem,
        onSuccess: () => {
        },
        onError: handleError
    });
};


export const useJoinRoom = () => {
    return useMutation({
        mutationFn: postJoinRoom,
        onSuccess: () => {
            window.location.reload();
        },
        onError: handleError
    });
};


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
        onError: handleError
    });
};


export const useDeleteRoom = () => {
    return useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            window.location.href = "/";
        },
        onError: handleError
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
                    <InfoModal detailMessage="회원가입이 완료되었습니다. 로그인해주세요."/>
                ),
                onClose: () => {
                    window.location.href = "/login"
                }
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
                    detailMessage = "solved.ac에 존재하지 않는 사용자입니다.";
                } else if (error.response.status === 429) {
                    detailMessage = "잠시 후 시도해주세요.";
                }
            }
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        }
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
                } else if (error.response.status === 429) {
                    detailMessage = "잠시 후 시도해주세요.";
                }
            }
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        }
    });
};