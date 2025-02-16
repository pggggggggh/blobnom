import {useMutation, useQuery} from '@tanstack/react-query';
import {RoomDetail} from "../types/RoomDetail.tsx";
import {BindPayload, LoginPayload, RegisterPayload, SolvedAcTokenResponse,} from "../types/Auth.tsx"
import {
    deleteRoom,
    fetchContestDetail,
    fetchContestList,
    fetchMainData,
    fetchMemberDetails,
    fetchRoomDetail,
    fetchSolvedAcToken,
    postBindAccount,
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
import {ContestSummary, MainData} from "../types/Summaries.tsx";
import {useRouter} from "@tanstack/react-router";
import InfoModal from "../components/Modals/InfoModal.tsx";
import {ContestDetail} from "../types/ContestDetail.tsx";
import {MemberDetails} from "../types/MemberDetails.tsx";

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


export const useRoomList = (page: number, search: string, activeOnly: boolean, myRoomOnly: boolean) => {
    return useQuery<MainData, Error>({
        queryKey: ['roomList', page, search, activeOnly, myRoomOnly],
        queryFn: () => fetchMainData(page, search, activeOnly, myRoomOnly),
    });
};


export const useContestList = () => {
    return useQuery<ContestSummary[], Error>({
        queryKey: ['contestList'],
        queryFn: () => fetchContestList(),
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

export const useMemberDetail = (handle: string) => {
    return useQuery<MemberDetails, Error>({
        queryKey: ['memberDetail', handle],
        queryFn: () => fetchMemberDetails(handle),
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
        onSuccess: (data) => {
            window.location.reload()
        },
        onError: handleError
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
            let detailMessage =
                error?.response?.data?.detail || "알 수 없는 에러가 발생했습니다.";
            if (error?.response?.status === 401)
                detailMessage = "로그인이 필요합니다.";
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


export const useBindAccount = () => {
    return useMutation({
        mutationFn: (payload: BindPayload) => postBindAccount(payload),
        onSuccess: () => {
            modals.open({
                children: (
                    <InfoModal detailMessage="연동이 완료되었습니다."/>
                ),
                onClose: () => {
                    window.location.href = "/"
                }
            });
        },
        onError: (error: any) => {
            console.log(error);
            let detailMessage = "연동 중 오류가 발생했습니다.";
            if (error?.response) {
                if (error.response.status === 400) {
                    detailMessage = "토큰 검증에 실패했습니다. 적용되는 데 시간이 걸릴 수 있으니 잠시만 기다려주세요.";
                } else if (error.response.status === 404) {
                    detailMessage = "존재하지 않는 사용자입니다.";
                } else if (error.response.status === 409) {
                    detailMessage = "이미 다른 계정과 연동된 핸들입니다.";
                } else if (error.response.status === 429) {
                    detailMessage = "잠시 후 시도해주세요.";
                }
            }
            modals.open({
                children: <ErrorModal detailMessage={detailMessage}/>,
            });
        }
    });
}


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
                } else if (error.response.status === 400) {
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