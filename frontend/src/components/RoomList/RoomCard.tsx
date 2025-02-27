import {roomSummary} from "../../types/Summaries.tsx";
import {Box, Button, Card, Flex, Group, Text} from "@mantine/core";
import HandleComponent from "../HandleComponent.tsx";
import {Link} from "@tanstack/react-router";
import {IconClock, IconHexagons, IconLock, IconUserCheck} from "@tabler/icons-react";
import dayjs from "dayjs";
import PlatformIcon from "../PlatformIcon.tsx";

interface RoomCardProps {
    roomSummary: roomSummary
}

const RoomCard = ({roomSummary}: RoomCardProps) => {
    const duration = dayjs.duration(dayjs(roomSummary.ends_at).diff(dayjs(roomSummary.starts_at))).humanize()

    return (
        <Card
            key={roomSummary.id}
            withBorder
            shadow="sm"
        >
            <Group justify="space-between">
                <Box w={{base: 120, xs: 180, sm: 270, md: 500}}>
                    <Flex align="center">
                        <Text>
                            <PlatformIcon platform={roomSummary.platform}/>
                        </Text>
                        <Text ml={5}>
                            {roomSummary.name}
                        </Text>
                        <Text>
                            {roomSummary.is_private && <IconLock size="18"/>}
                        </Text>
                    </Flex>
                    <Text fw={200} size="sm">
                        방장:&nbsp;
                        {
                            roomSummary.owner && <HandleComponent member={roomSummary.owner}/>
                        }
                    </Text>
                </Box>
                <Group>
                    <Group gap="xs" visibleFrom="sm">
                        <Box visibleFrom="sm">
                            <Group gap="xs">
                                <IconClock/>
                                <Text size="sm" w={40}>
                                    {duration}
                                </Text>
                            </Group>
                        </Box>
                        <Box visibleFrom="sm">
                            <Group gap="xs">
                                <IconUserCheck/>
                                <Text size="sm" w={40}>
                                    {roomSummary.num_players}/{roomSummary.max_players}
                                </Text>
                            </Group>
                        </Box>
                        <Box visibleFrom="sm">
                            <Group gap="xs">
                                <IconHexagons/>
                                <Text size="sm" w={40}>
                                    {roomSummary.num_solved_missions}/{roomSummary.num_missions}
                                </Text>
                            </Group>
                        </Box>
                    </Group>
                    <Link
                        to="/rooms/$roomId"
                        params={{
                            roomId: roomSummary.id.toString()
                        }}
                    >
                        <Button variant="light" fw={300}>
                            참여하기
                        </Button>
                    </Link>
                </Group>
            </Group>
        </Card>
    )
}

export default RoomCard;