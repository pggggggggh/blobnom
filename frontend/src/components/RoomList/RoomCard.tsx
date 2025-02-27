import {roomSummary} from "../../types/Summaries.tsx";
import {Box, Button, Card, Flex, Group, Stack, Text} from "@mantine/core";
import HandleComponent from "../HandleComponent.tsx";
import {Link} from "@tanstack/react-router";
import {IconClock, IconHexagons, IconLock, IconUserCheck} from "@tabler/icons-react";
import dayjs from "dayjs";
import PlatformIcon from "../PlatformIcon.tsx";
import RoomStatusBadge from "./RoomProgressBadge.tsx";

interface RoomCardProps {
    roomSummary: roomSummary
}

const RoomCard = ({roomSummary}: RoomCardProps) => {
    const duration = dayjs.duration(dayjs(roomSummary.ends_at).diff(dayjs(roomSummary.starts_at))).humanize()
    const now = new Date()

    return (
        <Card
            key={roomSummary.id}
            withBorder
            shadow="sm"
        >
            <Group justify="space-between">
                <Box>
                    <Flex align="center">
                        <Text mr={5}>
                            <PlatformIcon platform={roomSummary.platform}/>
                        </Text>
                        {roomSummary.name}
                        <Text>
                            {roomSummary.is_private && <IconLock size="18"/>}
                        </Text>
                    </Flex>
                    <Text size="sm">
                        방장:&nbsp;
                        {
                            roomSummary.owner && <HandleComponent member={roomSummary.owner}/>
                        }
                    </Text>
                </Box>
                <Group>
                    <Group gap="xs" visibleFrom="xs">
                        <RoomStatusBadge startsAt={roomSummary.starts_at} endsAt={roomSummary.ends_at} now={now}/>
                        <Stack gap={0} align="center" visibleFrom="sm">
                            <IconClock/>
                            {duration}
                        </Stack>
                        <Stack gap={0} align="center" visibleFrom="xs">
                            <IconUserCheck/>
                            {roomSummary.num_players}/{roomSummary.max_players}
                        </Stack>
                        <Stack gap={0} align="center" visibleFrom="xs">
                            <IconHexagons/>
                            {roomSummary.num_solved_missions}/{roomSummary.num_missions}
                        </Stack>
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