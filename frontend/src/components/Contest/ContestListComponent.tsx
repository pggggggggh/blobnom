import {Badge, Box, Button, Card, Group, Stack, Text} from "@mantine/core";
import dayjs, {Dayjs} from "dayjs";
import {ContestSummary} from "../../types/Summaries.tsx";
import PersonIcon from "@mui/icons-material/Person";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {Link} from "@tanstack/react-router";

const ContestListComponent = ({contests, cur_datetime, border}: {
    contests: ContestSummary[],
    cur_datetime: Dayjs,
    border: boolean
}) => {
    return (
        <Stack gap="sm">
            {contests?.map((contest) => {
                return (
                    <Card key={contest.id} withBorder shadow="sm"
                          style={{border: border ? '1px solid #DFCD7E' : 'none'}}>
                        <Group justify="space-between">
                            <Box w={{base: 120, xs: 180, sm: 270, md: 500}}>
                                <Text fw={500} size="lg">
                                    <Box component="span" c="yellow"><EmojiEventsIcon fontSize={"inherit"}
                                                                                      className="mr-1 "/></Box>
                                    {contest.name}
                                </Text>
                                <Text
                                    size="sm"
                                    className="text-gray-300 truncate w-full overflow-hidden whitespace-nowrap"
                                >
                                    {contest.desc}{contest.min_rating != null ? `, 레이팅 범위: ${contest.min_rating}~${contest.max_rating}` : ''}
                                </Text>

                            </Box>
                            <Group>
                                <Group gap="xs" visibleFrom="sm">
                                    {
                                        dayjs(contest.starts_at).isBefore(cur_datetime) ? (
                                            dayjs(contest.ends_at).isBefore(cur_datetime) ?
                                                <Badge className="font-medium" color="blue">
                                                    {dayjs(contest.ends_at).to(cur_datetime, true)} 전 종료
                                                </Badge>
                                                :
                                                <Badge className="font-medium" color="green">
                                                    {dayjs(contest.ends_at).to(cur_datetime, true)} 후 종료
                                                </Badge>
                                        ) : (
                                            <Badge className="font-medium" color="red">
                                                {dayjs(contest.starts_at).to(cur_datetime, true)} 후 시작
                                            </Badge>
                                        )
                                    }

                                    <Box visibleFrom="xs" w={80}>
                                        <Group gap="xs">
                                            <PersonIcon/>
                                            <Text size="sm" w={40}>
                                                {contest.num_participants}/∞
                                            </Text>
                                        </Group>
                                    </Box>
                                    <Box visibleFrom="sm" w={80}>
                                        <Group gap="xs">
                                            <TokenOutlinedIcon/>
                                            <Text size="sm" w={40}>
                                                {contest.missions_per_room}
                                            </Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Link
                                    to="/contests/$contestId"
                                    params={{
                                        contestId: contest.id.toString()
                                    }}
                                >
                                    <Button variant="light" color="yellow">
                                        입장하기
                                    </Button>
                                </Link>
                            </Group>
                        </Group>
                    </Card>
                );
            })}
        </Stack>
    )
}

export default ContestListComponent;