import {createLazyFileRoute} from '@tanstack/react-router';
import {Badge, Box, Button, Card, Container, Group, Pagination, Stack, Text, TextInput} from "@mantine/core";
import {IconHexagons, IconSearch, IconUsers} from '@tabler/icons-react';
import {useRoomList} from "../hooks/hooks.tsx";
import {useEffect} from "react";

export const Route = createLazyFileRoute('/')({
    component: Index,
})

function Index() {
    const {data: rooms, isLoading, error} = useRoomList();

    useEffect(() => {
        if (isLoading) {
            console.log('Loading...');
        } else if (error) {
            console.log('Error:', error);
        } else {
            console.log('Rooms data:', rooms);
        }
    }, [isLoading, error, rooms]);

    if (isLoading) return (<div></div>);

    return (
        <Container size="lg">
            <Group justify="space-between" mb="md">
                <Group>
                    <TextInput
                        placeholder="방 검색..."
                        leftSection={<IconSearch size={16}/>}
                    />
                </Group>
            </Group>
            <Stack gap="sm">
                {rooms?.publicroom.map((room) => (
                    <Card key={room.id} withBorder shadow="sm">
                        <Group justify="space-between">
                            <Box w={{base: 10, xs: 150, sm: 300, md: 500}}>
                                <Text fw={500} size="lg" truncate>
                                    {room.name}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    방장: plast
                                </Text>
                            </Box>
                            <Group>
                                <Group w={220}>
                                    <Badge color='green'>
                                        진행 중
                                    </Badge>
                                    <Box w={65}>
                                        <Group gap="xs">
                                            <IconUsers size={16}/>
                                            <Text size="sm" w={30} ta="right">
                                                {room.users}/20
                                            </Text>
                                        </Group>
                                    </Box>
                                    <Box w={65}>
                                        <Group gap="xs">
                                            <IconHexagons size={16}/>
                                            <Text size="sm" w={30} ta="right">
                                                1/{room.size}
                                            </Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Button variant='filled'>
                                    참여하기
                                </Button>
                            </Group>
                        </Group>
                    </Card>
                ))}
            </Stack>

            {/* 페이지네이션 */}
            <Group justify="center" mt="xl">
                <Pagination total={10}/>
            </Group>
        </Container>
    );
}