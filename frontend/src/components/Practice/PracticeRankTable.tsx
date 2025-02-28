import {ActionIcon, Badge, Box, Card, Flex, Table, Text, Title} from "@mantine/core";
import dayjs from "dayjs";
import React from "react";
import {PracticeRankData} from "../../types/PracticeRankData.tsx";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../context/AuthProvider.tsx";
import {IconRefresh} from "@tabler/icons-react";

interface PracticeRankTableProps {
    data: PracticeRankData;
    refetch: any;
    isPending: boolean;
}

const PracticeRankTable = ({data, refetch, isPending}: PracticeRankTableProps) => {
    const {t} = useTranslation();
    const auth = useAuth();
    const [isCooldown, setIsCooldown] = React.useState(false);

    const handleRefresh = () => {
        if (isCooldown) return;
        setIsCooldown(true);
        refetch();
        setTimeout(() => setIsCooldown(false), 3000);
    };

    return (
        <Card shadow="sm" p="md" withBorder>
            <Flex justify="space-between" mb="xs">
                <Title order={2}>{data.practice_name}
                    {data.time ?
                        <Text mb="lg">
                            {dayjs.unix(data.time).utc().format('HH:mm:ss')} 기준 순위
                        </Text> : <Box></Box>
                    }
                </Title>

                <ActionIcon loading={isPending || isCooldown} onClick={handleRefresh}>
                    <IconRefresh/>
                </ActionIcon>
            </Flex>
            <Table highlightOnHover withColumnBorders striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{width: '5%'}}></Table.Th>
                        <Table.Th style={{width: '25%'}} align="center">
                            {t('이름')}
                        </Table.Th>
                        <Table.Th style={{width: '10%'}} align="center">
                            {t('점수')}
                        </Table.Th>
                        <Table.Th style={{width: '10%'}} align="center">
                            {t('패널티')}
                        </Table.Th>
                        {data.rank[0].solve_time_list.map((item, i) => (
                            <Table.Th
                                style={{
                                    width: `${50 / data.rank[0].solve_time_list.length}%`,
                                    textAlign: 'center',
                                }}
                                key={i}
                            >
                                {`${String.fromCharCode(65 + i)}`}
                            </Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data.rank.map((item, i) => (
                        <Table.Tr key={i}>
                            <Table.Td align="center">{i + 1}</Table.Td>
                            <Table.Td>
                                <Flex align="center" justify="space-between">
                                    {auth?.member && i + 1 === data.your_rank ? (
                                        <Text fw="bold">
                                            {auth.member.handle}
                                        </Text>
                                    ) : (
                                        <Text c="dimmed">****</Text>
                                    )}
                                    {item.running_time && (
                                        <Badge color="red" size="sm" ml="xs">
                                            {dayjs.unix(item.running_time).utc().format('HH:mm')}
                                        </Badge>
                                    )}
                                </Flex>
                            </Table.Td>
                            <Table.Td align="center" fw="bold" color="blue">
                                {item.score}
                            </Table.Td>
                            <Table.Td align="center" color="dimmed">
                                {item.penalty}
                            </Table.Td>
                            {data.rank[i].solve_time_list.map((time, timeIndex) => (
                                time === null ? (
                                    <Table.Td key={timeIndex}></Table.Td>
                                ) : (
                                    <Table.Td
                                        key={timeIndex}
                                        align="center"
                                    >
                                        <Text c="green" fw="bold">
                                            {dayjs.unix(time).utc().format('HH:mm')}
                                        </Text>
                                    </Table.Td>
                                )
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Card>
    );
}

export default PracticeRankTable;