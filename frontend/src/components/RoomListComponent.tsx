import {Badge, Box, Button, Card, Group, Stack, Text} from "@mantine/core";
import {IconHexagons, IconUsers} from "@tabler/icons-react";
import {RoomListDTO} from "../types/roomInfo.tsx";

const RoomListComponent = ({rooms}: { rooms: RoomListDTO }) => {
    return (
        <Stack gap="sm">
            {rooms?.publicroom?.map((room) => (
                <Card key={room.id} withBorder shadow="sm">
                    <Group justify="space-between">
                        <Box w={{base: 150, xs: 200, sm: 300, md: 500}}>
                            <Text fw={500} size="lg" truncate>
                                {room.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                                방장: plast
                            </Text>
                        </Box>
                        <Group>
                            <Group>
                                <Badge color='green'>
                                    진행 중
                                </Badge>
                                <Box visibleFrom="xs" w={65}>
                                    <Group gap="xs">
                                        <IconUsers size={16}/>
                                        <Text size="sm" w={30} ta="right">
                                            {room.users}/20
                                        </Text>
                                    </Group>
                                </Box>
                                <Box visibleFrom="sm" w={65}>
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
    );
}

export default RoomListComponent;