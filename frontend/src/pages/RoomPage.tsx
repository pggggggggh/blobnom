import {useRoomDetail} from "../hooks/hooks.tsx";
import React, {useEffect, useState} from "react";
import {ChatMessage} from "../types/ChatMessage.tsx";
import {useSocket} from "../context/SocketProvider.tsx";
import {useAuth} from "../context/AuthProvider.tsx";
import {requestNotificationPermission, showNotification} from "../utils/NotificationUtils.tsx";
import {Box} from "@mantine/core";
import {HexComponent} from "../components/Room/HexComponent.tsx";
import {Route} from "../routes/rooms/$roomId.tsx";
import RoomFloatingComponent from "../components/Room/RoomFloatingComponent.tsx";
import ChatBoxComponent from "../components/Room/ChatBoxComponent.tsx";
import {notifications} from "@mantine/notifications";
import dayjs from "dayjs";
import NotFound from "./NotFound.tsx";
import {AxiosError} from "axios";


export default function RoomPage() {
    const {roomId} = Route.useParams();
    const {data: roomDetails, isError, isLoading, error, refetch} = useRoomDetail(parseInt(roomId));
    const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [myTeamIndex, setMyTeamIndex] = useState(null);
    const socket = useSocket()
    const auth = useAuth();


    useEffect(() => {
        if (!auth.user) return;
        if (!roomDetails) return;
        for (let i = 0; i < roomDetails.team_info.length; i++) {
            for (const user of roomDetails.team_info[i].users) {
                if (user.user.handle == auth.user) {
                    setMyTeamIndex(i)
                    break;
                }
            }
            if (myTeamIndex != null) break;
        }
    }, [roomDetails]);

    const handleSendMessage = (msg: string) => {
        const message: ChatMessage = {
            handle: auth.user,
            type: "message",
            message: msg,
            time: new Date(),
            team_index: myTeamIndex
        }
        socket.emit("room_send_message", {
            roomId: roomDetails.id,
            payload: message
        })
    }

    useEffect(() => {
        if (!socket) return;
        if (!roomDetails) return;

        socket.emit("join_room", {roomId: roomDetails.id, handle: auth.user});
        const handlePreviousMessages = (data: ChatMessage[]) => {
            let msgs: ChatMessage[] = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].type !== "system") msgs.push(data[i]);
            }
            setMessages(msgs);
        };

        const handleNewMessage = (data: ChatMessage) => {
            if (data.type == "system") {
                if (!data.message.startsWith(auth.user)) {
                    notifications.show({
                        title: data.message,
                        message: dayjs(data.time).format("YYYY-MM-DD HH:mm:ss"),
                        autoClose: false,

                    })
                }
            } else setMessages(prevMessages => [...prevMessages, data]);

            refetch();
        };

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

        const handleActiveUsers = (data) => {
            if (Array.isArray(data))
                setActiveUsers(new Set(data));
        };

        socket.on("room_new_message", handleNewMessage);
        socket.on("previous_messages", handlePreviousMessages);
        socket.on("problem_solved", handleProblemSolved);
        socket.on("room_started", handleRoomStarted);
        socket.on("active_users", handleActiveUsers);

        return () => {
            socket.emit("leave_room", {roomId, handle: auth.user});

            socket.off("problem_solved", handleProblemSolved);
            socket.off("room_started", handleRoomStarted);
            socket.off("active_users", handleActiveUsers);
            socket.off("room_new_message", handleNewMessage);
            socket.off("previous_messages", handlePreviousMessages);
        };
    }, [roomDetails?.id]);

    if ((error as AxiosError)?.status === 404) return <NotFound/>;
    if (isLoading) return <div></div>;

    return (
        <Box className="relative">
            <RoomFloatingComponent roomDetail={roomDetails} activeUsers={activeUsers}/>
            {roomDetails.is_started && <HexComponent roomDetail={roomDetails}/>}

            <ChatBoxComponent messages={messages} handleSendMessage={handleSendMessage}/>
        </Box>
    );
}

