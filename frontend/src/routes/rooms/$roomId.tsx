import React, {useEffect} from "react";
import {createFileRoute} from '@tanstack/react-router'
import {useRoomDetail} from "../../hooks/hooks.tsx";
import {Box} from "@mantine/core";
import {HexComponent} from "../../components/HexComponent.tsx";
import RoomFloatingComponent from "../../components/RoomFloatingComponent.tsx";
import {requestNotificationPermission, showNotification} from "../../utils/NotificationUtils.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";
import {useSocket} from "../../context/SocketProvider.tsx";
import ChatBoxComponent from "../../components/ChatBoxComponent.tsx";

export const Route = createFileRoute('/rooms/$roomId')({
    component: RouteComponent,
});

function RouteComponent() {
    const {roomId} = Route.useParams();
    const {data: roomDetail, isLoading, error, refetch} = useRoomDetail(parseInt(roomId));
    const socket = useSocket()

    const auth = useAuth();

    useEffect(() => {
        if (!roomId || !socket) return;

        socket.emit("join_room", {roomId, handle: auth.user});

        const handleProblemSolved = (data) => {
            requestNotificationPermission().then(() => {
                showNotification("Blobnom", `${data.username}가 ${data.problem_id}를 해결하였습니다.`);
            });
            refetch();
        };

        const handleRoomStarted = (data) => {
            requestNotificationPermission().then(() => {
                showNotification("Blobnom", `게임이 시작되었습니다.`);
            });
            refetch();
        };

        socket.on("problem_solved", handleProblemSolved);
        socket.on("room_started", handleRoomStarted);

        return () => {
            socket.emit("leave_room", {roomId, handle: auth.user});

            socket.off("problem_solved", handleProblemSolved);
            socket.off("room_started", handleRoomStarted);
        };
    }, [roomId, socket]);


    if (isLoading || error || !roomDetail) return (<div></div>);

    return (
        <Box className="relative">
            <RoomFloatingComponent roomDetail={roomDetail}/>
            {roomDetail.is_started && <HexComponent roomDetail={roomDetail}/>}

            <ChatBoxComponent roomDetails={roomDetail} refetch={refetch}/>
        </Box>
    );
}
