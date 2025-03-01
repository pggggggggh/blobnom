import {Avatar, Card, Flex, Group, Stack, Table, Text, Title} from "@mantine/core";
import {IconTrophy} from "@tabler/icons-react";
import HandleComponent from "../HandleComponent.tsx";
import dayjs from "dayjs";
import React from "react";
import {useLeaderboards} from "../../hooks/hooks.tsx";
import {useTranslation} from "react-i18next";

const LeaderboardsCard = () => {
    const {t} = useTranslation();
    const {data: leaderboardsData, isLoading, error} = useLeaderboards();

    return (
        <Card withBorder shadow="sm" p="md">
            <Group justify="space-between" mb="md">
                <Title order={4} style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <IconTrophy size={20} color="gold"/>
                    {t("리더보드")}
                </Title>
            </Group>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t("순위")}</Table.Th>
                        <Table.Th>{t("사용자")}</Table.Th>
                        <Table.Th>{t("점수")}</Table.Th>
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
                                <Text size="xs"
                                      c="dimmed">{t("num_problems", {n: entry.num_solved_missions})}</Text>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            <Stack gap={0} mt="lg" w="100%" justify="flex-end" align="flex-end">
                <Text size="xs" c="dimmed">
                    {t("updated", {t: dayjs(leaderboardsData?.updated_at).fromNow()})}
                </Text>
            </Stack>
        </Card>
    )
}

export default LeaderboardsCard;