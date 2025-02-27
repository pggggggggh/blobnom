import {Avatar, Card, Flex, Group, Stack, Table, Text, Title} from "@mantine/core";
import {IconTrophy} from "@tabler/icons-react";
import React from "react";
import StatsCard from "../Sidebar/StatsCard.tsx";
import {useLeaderboards} from "../../hooks/hooks.tsx";
import HandleComponent from "../HandleComponent.tsx";
import dayjs from "dayjs";

const SidebarComponent = () => {
    const {data: leaderboardsData, isLoading, error} = useLeaderboards();
    const leaderboardData = [
        {rank: 1, username: "codemaster", handle: "codemstr", score: 9850, solved: 142, change: "up"},
        {rank: 2, username: "algorithms_pro", handle: "algopro", score: 8720, solved: 128, change: "same"},
        {rank: 3, username: "bytewizard", handle: "bytewiz", score: 7950, solved: 115, change: "up"},
        {rank: 4, username: "debugdiva", handle: "debug_d", score: 7640, solved: 112, change: "down"},
        {rank: 5, username: "quantumcoder", handle: "q_coder", score: 7320, solved: 104, change: "up"},
        {rank: 6, username: "pythonista", handle: "py_dev", score: 6780, solved: 98, change: "down"},
        {rank: 7, username: "leetcode_guru", handle: "leet_g", score: 6540, solved: 92, change: "same"},
    ];

    return (
        <Stack>
            <StatsCard/>

            <Card withBorder shadow="sm" p="md">
                <Group justify="space-between" mb="md">
                    <Title order={4} style={{display: "flex", alignItems: "center", gap: "8px"}}>
                        <IconTrophy size={20} color="gold"/>
                        리더보드
                    </Title>
                </Group>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>순위</Table.Th>
                            <Table.Th>사용자</Table.Th>
                            <Table.Th style={{textAlign: "right"}}>점수</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {leaderboardsData?.leaderboards.map((entry, i) => (
                            <Table.Tr key={i + 1}>
                                <Table.Td>
                                    <Text
                                        fw={i + 1 <= 3 ? 700 : 500}
                                        c={i + 1 === 1 ? "yellow" : i + 1 === 2 ? "gray" : i + 1 === 3 ? "orange" : "dimmed"}
                                    >
                                        {i + 1}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Flex gap="xs">
                                        <Avatar
                                            name={entry.member_summary.handle}
                                            color="initials"
                                            size="sm"
                                        />
                                        <Text size="sm" fw={500}><HandleComponent member={entry.member_summary}/></Text>
                                    </Flex>
                                </Table.Td>
                                <Table.Td style={{textAlign: "right"}}>
                                    <Text size="sm" fw={700}>{entry.points.toLocaleString()}</Text>
                                    <Text size="xs" c="dimmed">{entry.num_solved_missions} 문제</Text>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                <Stack gap={0} mt="lg" w="100%" justify="flex-end" align="flex-end">
                    <Text size="xs" c="dimmed">
                        {dayjs(leaderboardsData?.updated_at).fromNow()} 업데이트됨
                    </Text>
                </Stack>
            </Card>
        </Stack>
    )
}
export default SidebarComponent