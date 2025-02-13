import {ActionIcon, Box, ScrollArea, Text} from "@mantine/core";
import {useEffect, useRef, useState} from "react";
import {useAuth} from "../../context/AuthProvider.tsx";
import MinimizeIcon from '@mui/icons-material/Minimize';
import {ChatMessage} from "../../types/ChatMessage.tsx";
import dayjs from "dayjs";

const ChatBoxComponent = ({messages, handleSendMessage}: { messages: ChatMessage[], handleSendMessage: any }) => {
    const auth = useAuth()
    const [isChatMinimized, setIsChatMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
        }
    }, [messages]);

    return (
        <Box
            className={`absolute left-0 bottom-0 xs:w-40 lg:w-80 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm ${
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
                                                    {dayjs().isBefore(msg.time) ? "지금" : dayjs(msg.time).fromNow()}
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
