import {Badge, Box, Button, Card, Group, Image, Stack, Text} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import {RoomSummary} from "../types/Summaries.tsx";
import TokenOutlinedIcon from '@mui/icons-material/TokenOutlined';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import dayjs, {Dayjs} from "dayjs";
import HandleComponent from "./HandleComponent.tsx";
import logo_boj from "/platforms/boj.png";
import logo_codeforces from "/platforms/codeforces.png";
import {Platform} from "../types/Platforms.tsx";

const RoomListComponent = ({rooms, cur_datetime}: { rooms: RoomSummary[], cur_datetime: Dayjs }) => {
    console.log(rooms)
    return (
        <Stack gap="sm">
            {rooms?.map((room) => {
                return (
                    !room.is_contest_room &&
                    <Card
                        key={room.id}
                        withBorder
                        shadow="sm"
                        className="text-white "
                    >
                        <Group justify="space-between">
                            <Box w={{base: 120, xs: 180, sm: 270, md: 500}}>
                                <Text fw={300} size="lg" className="flex items-center gap-1">
                                    {room.is_private && <LockIcon fontSize={"inherit"} className="mr-1"/>}
                                    <Image w={16} src={room.platform == Platform.BOJ ? logo_boj : logo_codeforces}/>
                                    {room.name}
                                </Text>

                                <Text fw={200} size="sm" c="dimmed">
                                    방장:&nbsp;
                                    {
                                        <HandleComponent user={room.owner}/>
                                    }
                                </Text>
                            </Box>
                            <Group>
                                <Group gap="xs" visibleFrom="sm">
                                    {
                                        dayjs(room.starts_at).isBefore(cur_datetime) ? (
                                            dayjs(room.ends_at).isBefore(cur_datetime) ?
                                                <Badge variant="gradient"
                                                       gradient={{from: 'indigo', to: 'blue', deg: 90}}
                                                       className="font-medium">
                                                    {dayjs(room.ends_at).to(cur_datetime, true)} 전 종료
                                                </Badge>
                                                :
                                                <Badge variant="gradient"
                                                       gradient={{from: 'green', to: 'teal', deg: 90}}
                                                       className="font-medium"
                                                >
                                                    {dayjs(room.ends_at).to(cur_datetime, true)} 후 종료
                                                </Badge>
                                        ) : (
                                            <Badge
                                                variant="gradient"
                                                gradient={{from: 'red', to: 'pink', deg: 90}}
                                                className="font-medium">
                                                {dayjs(room.starts_at).to(cur_datetime, true)} 후 시작
                                            </Badge>
                                        )
                                    }

                                    <Box visibleFrom="xs" w={80}>
                                        <Group gap="xs">
                                            <PersonIcon/>
                                            <Text fw={200} size="sm" w={40} ta="">
                                                {room.num_players}/{room.max_players}
                                            </Text>
                                        </Group>
                                    </Box>
                                    <Box visibleFrom="sm" w={80}>
                                        <Group gap="xs">
                                            <TokenOutlinedIcon/>
                                            <Text fw={200} size="sm" w={40} ta="">
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
                                    <Button variant="light" fw={300}>
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
