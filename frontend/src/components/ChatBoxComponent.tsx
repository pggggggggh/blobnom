import {ActionIcon, Box, ScrollArea, Text} from "@mantine/core";
import {useEffect, useRef, useState} from "react";
import {useAuth} from "../context/AuthProvider.tsx";
import MinimizeIcon from '@mui/icons-material/Minimize';
import {ChatMessage} from "../types/ChatMessage.tsx";
import {RoomDetail} from "../types/RoomDetail.tsx";
import dayjs from "dayjs";
import {useSocket} from "../context/SocketProvider.tsx";

const ChatBoxComponent = ({roomDetails, refetch}: { roomDetails: RoomDetail, refetch: any }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const auth = useAuth()
    const [isChatMinimized, setIsChatMinimized] = useState(false);
    const [myTeamIndex, setMyTeamIndex] = useState(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const socket = useSocket()

    useEffect(() => {
        if (!auth.user) return;
        for (let i = 0; i < roomDetails.team_info.length; i++) {
            for (const user of roomDetails.team_info[i].users) {
                if (user.user.handle == auth.user) {
                    setMyTeamIndex(i)
                    break;
                }
            }
            if (myTeamIndex != null) break;
        }
    });

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (data: ChatMessage) => {
            if (data.type == "system") refetch();
            setMessages(prevMessages => [...prevMessages, data]);
        };
        socket.on("room_new_message", handleNewMessage);
        return () => {
            socket.off("room_new_message", handleNewMessage);
        };
    }, [roomDetails.id, socket]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

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

    return (
        <Box
            className={`absolute left-4 bottom-4 xs:w-40 lg:w-80 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                isChatMinimized ? 'h-10' : 'h-64'
            }`}
        >
            <Box className="flex flex-col h-full">
                <Box className="p-2 border-gray-600 flex justify-between items-center">
                    <Text className="text-white text-sm font-semibold mr-1">채팅</Text>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => setIsChatMinimized(!isChatMinimized)}
                        className="hover:bg-gray-900"
                    >
                        <MinimizeIcon/>
                    </ActionIcon>
                </Box>

                {!isChatMinimized && (
                    <>
                        <ScrollArea ref={scrollAreaRef} className="flex-grow p-2" type="hover">
                            {messages.map((msg, i) => (
                                <Box key={i} className="flex mb-2">
                                    {
                                        msg.type == "system" ?
                                            <>
                                                <Text className="text-green-500 text-xs">
                                                    {msg.message}
                                                </Text>
                                                <Text className="min-w-12 text-gray-400 text-xs ml-2">
                                                    {dayjs(msg.time).fromNow()}
                                                </Text>
                                            </>
                                            :
                                            <>
                                                <Text className="text-white text-xs">
                                                    <strong>{msg.handle}</strong>
                                                </Text>
                                                <Text className="text-white text-xs ml-1">
                                                    {msg.message}
                                                </Text>
                                                <Text className="min-w-12 text-gray-400 text-xs ml-2">
                                                    {dayjs(msg.time).fromNow()}
                                                </Text>
                                            </>
                                    }

                                </Box>
                            ))}
                            <div ref={messagesEndRef}/>
                        </ScrollArea>

                        <Box className="p-2 border-t border-gray-600">
                            {auth.user ? (
                                <input
                                    type="text"
                                    maxLength={500}
                                    placeholder="메시지를 입력하세요."
                                    className="w-full bg-gray-800 bg-opacity-50 text-white rounded px-2 py-1 text-sm focus:outline-none"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            if (e.currentTarget.value.trim().length > 0) {
                                                handleSendMessage(e.currentTarget.value.trim())
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    placeholder="채팅하려면 로그인해주세요."
                                    disabled
                                    className="w-full bg-gray-800 bg-opacity-50 text-white rounded px-2 py-1 text-sm focus:outline-none"
                                />
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    )
};

export default ChatBoxComponent;
