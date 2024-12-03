import {useMutation, useQuery} from '@tanstack/react-query';
import {RoomDetail} from "../types/RoomDetail.tsx";
import {fetchRoomDetail, fetchRoomList, postJoinRoom, postSolveProblem} from "../api/api.tsx";
import {RoomSummary} from "../types/RoomSummary.tsx";
import {modals} from "@mantine/modals";
import ErrorModal from "../components/Modals/ErrorModal.tsx";

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