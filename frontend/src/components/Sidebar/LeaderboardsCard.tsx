import {Avatar, Card, Flex, Group, Skeleton, Table, Text, Title} from "@mantine/core";
import {IconTrophy} from "@tabler/icons-react";
import HandleComponent from "../HandleComponent.tsx";
import React from "react";
import {useLeaderboards} from "../../hooks/hooks.tsx";
import {useTranslation} from "react-i18next";
import UpdatedTime from "../UI/UpdatedTime.tsx";

const LeaderboardsCard = () => {
    const {t} = useTranslation();
    const {data: leaderboardsData, isLoading, error} = useLeaderboards();

    if (isLoading) {
        return (
            <Card withBorder shadow="sm" p="md">
                <Group justify="space-between" mb="md">
                    <Title order={4} style={{display: "flex", alignItems: "center", gap: "8px"}}>
                        <IconTrophy size={20} color="gray"/>
                        <Skeleton height={20} width={120} radius="sm"/>
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
                        {[...Array(5)].map((_, i) => (
                            <Table.Tr key={i}>
                                <Table.Td>
                                    <Skeleton height={20} width={20} radius="sm"/>
                                </Table.Td>
                                <Table.Td>
                                    <Flex gap="xs">
                                        <Skeleton height={32} width={32} circle/>
                                        <Skeleton height={20} width={100} radius="sm"/>
                                    </Flex>
                                </Table.Td>
                                <Table.Td style={{textAlign: "right"}}>
                                    <Skeleton height={20} width={50} radius="sm"/>
                                    <Skeleton height={16} width={80} radius="sm" mt={4}/>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                <UpdatedTime updated_at={undefined}/>
            </Card>
        );
    }

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
                                <Text size="xs" c="dimmed">{t("num_problems", {n: entry.num_solved_missions})}</Text>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <UpdatedTime updated_at={leaderboardsData?.updated_at}/>
        </Card>
    );
}

export default LeaderboardsCard;
