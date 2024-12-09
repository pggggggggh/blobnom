import {useMutation, useQuery} from '@tanstack/react-query';
import {RoomDetail} from "../types/RoomDetail.tsx";
import {fetchMainData, fetchRoomDetail, postJoinRoom, postSolveProblem} from "../api/api.tsx";
import {modals} from "@mantine/modals";
import ErrorModal from "../components/Modals/ErrorModal.tsx";
import {MainData} from "../types/RoomSummary.tsx";

export const useRoomList = (page: number) => {
    return useQuery<MainData, Error>({
        queryKey: ['roomList', page],
        queryFn: () => fetchMainData(page),
        initialData: {"room_list": [], "total_pages": 0}
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
            window.location.reload();
        },
        onError: (error) => {
            console.log(error)
        }
    });
}

export const useJoinRoom = () => {
    return useMutation({
        mutationFn: postJoinRoom,
        onSuccess: () => {
            window.location.reload();
        },
        onError: (error: any) => {
            const detailMessage = error?.response?.data?.detail || "알 수 없는 에러가 발생했습니다.";
            modals.open(
                {
                    title: "에러",
                    children: <ErrorModal detailMessage={detailMessage}/>
                }
            )
        }
    });
}