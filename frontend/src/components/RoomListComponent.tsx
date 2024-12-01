import {Badge, Box, Button, Card, Group, Stack, Text} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import {RoomSummary} from "../types/RoomSummary.tsx";
import TokenOutlinedIcon from '@mui/icons-material/TokenOutlined';
import PersonIcon from '@mui/icons-material/Person';
import dayjs, {Dayjs} from "dayjs";

const RoomListComponent = ({rooms, cur_datetime}: { rooms: RoomSummary[], cur_datetime: Dayjs }) => {
    return (
        <Stack gap="sm">
            {rooms?.map((room) => {
                return (
                    <Card key={room.id} withBorder shadow="sm">
                        <Group justify="space-between">
                            <Box w={{base: 120, xs: 180, sm: 270, md: 500}}>
                                <Text fw={500} size="lg" truncate>
                                    {room.name}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    방장: {room.owner}
                                </Text>
                            </Box>
                            <Group>
                                <Group gap="xs">
                                    {
                                        dayjs.utc(room.starts_at).isBefore(cur_datetime) ? (
                                            <Badge color="green">
                                                {dayjs.utc(room.starts_at).to(cur_datetime, true)} 진행 중
                                            </Badge>
                                        ) : (
                                            <Badge color="red">
                                                {dayjs.utc(room.starts_at).to(cur_datetime, true)} 후 시작
                                            </Badge>
                                        )
                                    }

                                    <Box visibleFrom="xs" w={65}>
                                        <Group gap="xs">
                                            <PersonIcon/>
                                            <Text size="sm" w={20} ta="right">
                                                {room.num_players}/{room.max_players}
                                            </Text>
                                        </Group>
                                    </Box>
                                    <Box visibleFrom="sm" w={80}>
                                        <Group gap="xs">
                                            <TokenOutlinedIcon/>
                                            <Text size="sm" w={20} ta="right">
                                                {room.num_solved_missions}/{room.num_missions}
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
                                    <Button variant="filled">
                                        참여하기
                                    </Button>
                                </Link>
                            </Group>
                        </Group>
                    </Card>
                );
            })}
        </Stack>
    );
};

export default RoomListComponent;
