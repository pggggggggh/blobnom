import React from "react";
import {createFileRoute} from '@tanstack/react-router'
import {useRoomDetail} from "../../hooks/hooks.tsx";
import {Box} from "@mantine/core";
import {HexComponent} from "../../components/HexComponent.tsx";
import RoomFloatingComponent from "../../components/RoomFloatingComponent.tsx";
import {requestNotificationPermission, showNotification} from "../../utils/NotificationUtils.tsx";

export const Route = createFileRoute('/rooms/$roomId')({
    component: RouteComponent,
});

function RouteComponent() {
    const {roomId} = Route.useParams();
    const {data: roomDetail, isLoading, error, refetch} = useRoomDetail(parseInt(roomId));

    const apiUrl = import.meta.env.VITE_API_URL;
    const wsUrl = apiUrl.replace(/^http/, "ws");

    React.useEffect(() => {
        const websocket = new WebSocket(`${wsUrl}/ws/rooms/${roomId}`);
        websocket.onopen = () => {
            console.log('connected');
        };
        websocket.onerror = error => {
            console.error(error);
        };

        websocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log(message);
                if (message.type === "problem_solved") {
                    requestNotificationPermission().then(() => {
                        showNotification("Blobnom", `${message.username}가 ${message.problem_id}를 해결하였습니다.`);
                    });
                    refetch();
                }
                if (message.type === "room_started") {
                    requestNotificationPermission().then(() => {
                        showNotification("Blobnom", `게임이 시작되었습니다.`);
                    });
                    refetch();
                }
            } catch (e) {
                console.error('Failed to parse JSON:', e);
            }
        };

        return () => {
            websocket.close();
        };
    }, [roomId, refetch]);

    if (isLoading || error || !roomDetail) return (<div></div>);
    console.log(roomDetail);

    return (
        <Box className="relative">
            <RoomFloatingComponent roomDetail={roomDetail}/>
            {roomDetail.is_started && <HexComponent roomDetail={roomDetail}/>}
        </Box>
    );
}
