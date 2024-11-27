import {Badge, Box, Button, Card, Group, Stack, Text} from "@mantine/core";
import {IconHexagons, IconUsers} from "@tabler/icons-react";
import {Link} from "@tanstack/react-router";
import {RoomInfo} from "../types/roomInfo.tsx";

const RoomListComponent = ({rooms}: { rooms: RoomInfo[] }) => {
    return (
        <Stack gap="sm">
            {rooms?.map((room) => (
                <Card key={room.id} withBorder shadow="sm">
                    <Group justify="space-between">
                        <Box w={{base: 200, xs: 200, sm: 300, md: 500}}>
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
                                            {room.num_players}/{room.max_players}
                                        </Text>
                                    </Group>
                                </Box>
                                <Box visibleFrom="sm" w={65}>
                                    <Group gap="xs">
                                        <IconHexagons size={16}/>
                                        <Text size="sm" w={30} ta="right">
                                            1/3
                                        </Text>
                                    </Group>
                                </Box>
                            </Group>
                            <Link
                                to="/rooms/$roomId"
                                params={{
                                    roomId: room.id.toString()
                                }}
                            >
                                <Button variant='filled'>
                                    참여하기
                                </Button>
                            </Link>
                        </Group>
                    </Group>
                </Card>
            ))}
        </Stack>
    );
}

export default RoomListComponent;