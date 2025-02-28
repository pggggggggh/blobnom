import {Button, Group, Progress, Skeleton, Stack, Table, Text} from "@mantine/core";
import {IconArrowRight, IconClock, IconFileDescription, IconTrophy} from "@tabler/icons-react";
import {Link} from "@tanstack/react-router";
import React from "react";
import {usePracticeElegible} from "../../hooks/hooks.tsx";
import {PracticeSetSummary} from "../../types/ProblemSet.tsx";
import {useTranslation} from "react-i18next";

interface PracticeSetProps {
    practiceSets: PracticeSetSummary[] | undefined;

}

const PracticeListTable = ({practiceSets}: PracticeSetProps) => {
    const {t} = useTranslation();
    const mutation = usePracticeElegible()

    const renderDifficulty = (level: number) => {
        const color = level <= 2 ? "green" : level <= 3 ? "yellow" : level <= 4 ? "orange" : "red";
        return (
            <Group gap={4}>
                <Progress
                    value={level * 20}
                    color={color}
                    size="sm"
                    flex="1"
                />
                <Text size="xs" fw={600} c={color}>Lv.{level}</Text>
            </Group>
        );
    };

    const handleEnter = (id: number) => {
        mutation.mutate({practiceId: id})
    }

    return (
        <>
            {!practiceSets ? (
                <Stack>
                    {Array.from({length: 3}).map((_, index) => (
                        <Skeleton key={index} height={80} radius="sm"/>
                    ))}
                </Stack>
            ) : (
                <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{t('제목')}</Table.Th>
                            <Table.Th>{t('난이도')}</Table.Th>
                            <Table.Th>{t('문제 수')}</Table.Th>
                            <Table.Th>{t('시간')}</Table.Th>
                            <Table.Th>{t('')}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {practiceSets && practiceSets.length > 0 ? (
                            practiceSets.map((ps) => (
                                <Table.Tr key={ps.id}>
                                    <Table.Td>
                                        <Text size="sm">{ps.name}</Text>
                                    </Table.Td>
                                    <Table.Td>{renderDifficulty(ps.difficulty)}</Table.Td>
                                    <Table.Td>
                                        <Group gap={4}>
                                            <IconFileDescription size={16}/>
                                            <Text size="sm">{ps.num_missions}문제</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap={4}>
                                            <IconClock size={16}/>
                                            <Text
                                                size="sm">{Math.floor(ps.duration / 60)}시간 </Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Stack gap="xs">
                                            <Link to={`/practices/${ps.id}/rank`}>
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    color="yellow"
                                                    leftSection={<IconTrophy size={16}/>}
                                                    fullWidth
                                                >
                                                    {t('순위 확인')}
                                                </Button>
                                            </Link>
                                            {
                                                ps.your_room_id ?
                                                    <Link to={`/rooms/${ps.your_room_id}`}>
                                                        <Button
                                                            variant="light"
                                                            size="xs"
                                                            rightSection={<IconArrowRight size={16}/>}
                                                            fullWidth
                                                        >
                                                            {t('입장하기')}
                                                        </Button>
                                                    </Link> :
                                                    <Button
                                                        variant="light"
                                                        onClick={() => {
                                                            handleEnter(ps.id)
                                                        }}
                                                        size="xs"
                                                        rightSection={<IconArrowRight size={16}/>}
                                                        // loading={mutation.isPending}
                                                        fullWidth
                                                    >
                                                        {t('시작하기')}
                                                    </Button>
                                            }
                                        </Stack>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={8}>
                                    <Text ta="center" py="lg" c="dimmed">
                                        {t('연습이 없습니다.')}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            )}
        </>
    )
}
export default PracticeListTable;