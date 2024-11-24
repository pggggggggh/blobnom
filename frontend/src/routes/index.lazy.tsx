import {createLazyFileRoute} from '@tanstack/react-router';
import {Badge, Box, Button, Card, Container, Group, Pagination, Stack, Text, TextInput} from "@mantine/core";
import {IconHexagons, IconSearch, IconUsers} from '@tabler/icons-react';

export const Route = createLazyFileRoute('/')({
    component: Index,
})

function Index() {
    // 실제로는 API에서 받아올 데이터
    const rooms = [
        {
            id: 1,
            title: "ychangseok vs hyperion1019",
            host: "bnb2011",
            users: 2,
            maxUsers: 4,
            problems: 2,
            maxProblems: 17,
            status: "waiting", // waiting, playing, ended
        },
        // ... 더 많은 방 데이터
    ];

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
                {rooms.map((room) => (
                    <Card key={room.id} withBorder shadow="sm">
                        <Group justify="space-between">
                            <Box w={{base: 200, sm: 300, md: 500}}>
                                <Text fw={500} size="lg" truncate>
                                    {room.title}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    방장: {room.host}
                                </Text>
                            </Box>
                            <Group>
                                <Badge
                                    color={room.status === 'waiting' ? 'green' : 'yellow'}
                                >
                                    {room.status === 'waiting' ? '대기중' : '게임중'}
                                </Badge>
                                <Group gap="xs">
                                    <IconUsers size={16}/>
                                    <Text size="sm">
                                        {room.users}/{room.maxUsers}
                                    </Text>
                                </Group>
                                <Group gap="xs">
                                    <IconHexagons size={16}/>
                                    <Text size="sm">
                                        {room.problems}/{room.maxProblems}
                                    </Text>
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