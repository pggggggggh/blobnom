import {useRoomDetail} from "../hooks/hooks.tsx";
import React, {useEffect, useState} from "react";
import {ChatMessage} from "../types/ChatMessage.tsx";
import {useSocket} from "../context/SocketProvider.tsx";
import {useAuth} from "../context/AuthProvider.tsx";
import {requestNotificationPermission, showNotification} from "../utils/NotificationUtils.tsx";
import {Route} from "../routes/rooms/$roomId.tsx";
import ChatBoxComponent from "../components/Room/ChatBoxComponent.tsx";
import {notifications} from "@mantine/notifications";
import dayjs from "dayjs";
import NotFound from "./NotFound.tsx";
import {AxiosError} from "axios";
import {getDiffTime} from "../utils/TimeUtils.tsx";
import RoomInfoComponent from "../components/Room/RoomInfoComponent.tsx";
import TeamStatusBox from "../components/Room/TeamStatusBox.tsx";
import {userColors} from "../constants/UserColorsFill.tsx";
import {Box} from "@mantine/core";
import {HexComponent} from "../components/Room/HexComponent.tsx";
import RoomCountdown from "../components/Room/RoomCountdown.tsx";


export default function RoomPage() {
    const {roomId} = Route.useParams();
    const {data: roomDetails, isError, isLoading, error, refetch} = useRoomDetail(parseInt(roomId));
    const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [myTeamIndex, setMyTeamIndex] = useState<number | null>(null);
    const socket = useSocket()
    const auth = useAuth();
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [timeBefore, setTimeBefore] = useState<string>("");

    useEffect(() => {
        if (!roomDetails) return;

        const startInterval = setInterval(() => setTimeBefore(getDiffTime(new Date(), new Date(roomDetails.starts_at))), 1000);
        if (roomDetails.is_started) {
            clearInterval(startInterval);
            setTimeLeft(getDiffTime(new Date(), new Date(roomDetails.ends_at)))
            setInterval(() => setTimeLeft(getDiffTime(new Date(), new Date(roomDetails.ends_at))), 1000);
        } else {
            setTimeBefore(getDiffTime(new Date(), new Date(roomDetails.starts_at)))
        }
    }, [roomDetails]);


    useEffect(() => {
        if (!auth.member || !roomDetails) return;
        for (let i = 0; i < roomDetails.team_info.length; i++) {
            for (const user of roomDetails.team_info[i].users) {
                if (user.user.handle == auth.member.handle) {
                    setMyTeamIndex(i)
                    break;
                }
            }
            if (myTeamIndex != null) break;
        }
    }, [roomDetails]);

    const handleSendMessage = (msg: string) => {
        if (!roomDetails || !auth?.member || !socket) return;
        const message: ChatMessage = {
            handle: auth.member.handle,
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
        if (!roomDetails || !socket || !auth) return;

        socket.emit("join_room", {roomId: roomDetails.id, handle: auth.member?.handle});
        const handlePreviousMessages = (data: ChatMessage[]) => {
            const msgs: ChatMessage[] = [];
            for (let i = 0; i < data.length; i++) {
                if (data[i].type !== "system") msgs.push(data[i]);
            }
            setMessages(msgs);
        };

        const handleNewMessage = async (data: ChatMessage) => {
            if (data.type == "system") {
                if (!data.message.startsWith(auth.member?.handle)) {
                    notifications.show({
                        title: data.message,
                        message: dayjs(data.time).format("YYYY-MM-DD HH:mm:ss"),
                        autoClose: false,

                    })
                }
            } else setMessages(prevMessages => [...prevMessages, data]);
            await refetch();
        };

        const handleProblemSolved = async (data) => {
            requestNotificationPermission().then(() => {
                showNotification("Blobnom", `${data.username}가 ${data.problem_id}를 해결하였습니다.`);
            });
            await refetch();
        };

        const handleRoomStarted = async (data) => {
            requestNotificationPermission().then(() => {
                showNotification("Blobnom", `게임이 시작되었습니다.`);
            });
            await refetch();
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
            socket.emit("leave_room", {roomId, handle: auth.member?.handle});

            socket.off("problem_solved", handleProblemSolved);
            socket.off("room_started", handleRoomStarted);
            socket.off("active_users", handleActiveUsers);
            socket.off("room_new_message", handleNewMessage);
            socket.off("previous_messages", handlePreviousMessages);
        };
    }, [roomDetails, auth]);

    if ((error as AxiosError)?.status === 404 || (error as AxiosError)?.status === 422) return <NotFound/>;
    if (!roomDetails || isLoading) return <div></div>;

    return (
        <Box h="calc(100vh - 100px)">
            <RoomInfoComponent roomDetail={roomDetails} timeLeft={timeLeft}/>
            <ChatBoxComponent messages={messages} handleSendMessage={handleSendMessage}/>
            <TeamStatusBox roomDetails={roomDetails} userColors={userColors} activeUsers={activeUsers}/>
            {roomDetails.is_started ? <HexComponent roomDetails={roomDetails}/> :
                <RoomCountdown timeBefore={timeBefore}/>
            }
        </Box>
    );
}
