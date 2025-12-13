import {Box, Card, Flex, Group, ScrollArea, Stack, Text, TextInput, UnstyledButton} from "@mantine/core";
import {useEffect, useRef, useState} from "react";
import {useAuth} from "../../context/AuthProvider.tsx";
import {IconChevronDown} from "@tabler/icons-react";
import {ChatMessage} from "../../types/ChatMessage.tsx";
import dayjs from "dayjs";
import {useTranslation} from "react-i18next";

const ChatBoxComponent = ({messages, handleSendMessage}: { messages: ChatMessage[], handleSendMessage: any }) => {
    const {t} = useTranslation();
    const auth = useAuth();
    const [input, setInput] = useState("");
    const [isChatMinimized, setIsChatMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
        }
    }, [messages, isChatMinimized]);

    return (
        <Card
            padding="xs"
            shadow="md"
            className={`fixed right-4 top-[4+60px] w-48 sm:w-64 md:w-72 lg:w-80 transition-all duration-300 ${
                isChatMinimized ? "h-10" : "h-64"
            }`}
            radius="md"
        >
            <Box className="flex flex-col h-full">
                <Flex justify="space-between" align="center" mb="xs">
                    <Text size="sm">
                        {t("채팅")}
                    </Text>
                    <UnstyledButton
                        size="sm"
                        onClick={() => setIsChatMinimized((prev) => !prev)}
                    >
                        <IconChevronDown
                            className={`transition-transform duration-300 ${
                                isChatMinimized ? "" : "rotate-180"
                            }`}
                            size={16}
                        />
                    </UnstyledButton>
                </Flex>

                {!isChatMinimized && (
                    <>
                        <ScrollArea
                            ref={scrollAreaRef}
                            type="hover"
                            scrollbars={"y"}
                            scrollbarSize={6}
                            offsetScrollbars
                            style={{flex: 1}}
                        >
                            <Stack gap="xs" mt="sm">
                                {messages.map((msg, i) => {
                                        const system_m = msg.message.match(
                                            /^(.+?)가\s(.+?)를\s해결하였습니다\.$/
                                        )
                                            ? t("problem_solved", {
                                                handle: msg.message.match(
                                                    /^(.+?)가\s(.+?)를\s해결하였습니다\.$/
                                                )![1],
                                                problemId: msg.message.match(
                                                    /^(.+?)가\s(.+?)를\s해결하였습니다\.$/
                                                )![2],
                                            })
                                            : t(msg.message)

                                        return (
                                            <Box key={i}>
                                                {msg.type === "system" ? (
                                                    <Flex align="center">
                                                        <Text size="xs" c="teal">
                                                            {system_m}
                                                        </Text>
                                                        {msg.message !== "greeting_message" &&
                                                            <Text ml="xs" size="xs" c="dimmed">
                                                                {dayjs().isBefore(msg.time)
                                                                    ? t("지금")
                                                                    : dayjs(msg.time).fromNow()}
                                                            </Text>}
                                                    </Flex>
                                                ) : (
                                                    <Flex align="center">
                                                        <Group gap={3}
                                                               style={{wordWrap: "break-word", wordBreak: "break-word"}}>
                                                            <Text size="xs" fw={500}>
                                                                {msg.handle}
                                                            </Text>
                                                            <Text size="xs">
                                                                {msg.message}
                                                            </Text>
                                                        </Group>
                                                        <Text ml="xs" size="xs" c="dimmed">
                                                            {dayjs().isBefore(msg.time)
                                                                ? t("지금")
                                                                : dayjs(msg.time).fromNow()}
                                                        </Text>
                                                    </Flex>
                                                )}
                                            </Box>
                                        )
                                    }
                                )}
                                <div ref={messagesEndRef}/>
                            </Stack>
                        </ScrollArea>

                        <Box>
                            {auth.member ? (
                                <TextInput
                                    value={input}
                                    onChange={(e) => setInput(e.currentTarget.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            if (e.nativeEvent.isComposing) return;
                                            const v = input.trim();
                                            if (!v) return;
                                            handleSendMessage(v);
                                            setInput("");
                                        }
                                    }}
                                />
                            ) : (
                                <TextInput
                                    type="text"
                                    maxLength={500}
                                    placeholder={t("채팅하려면 로그인해주세요.")}
                                    disabled
                                />
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </Card>
    );
};

export default ChatBoxComponent;