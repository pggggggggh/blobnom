import React, {useMemo} from "react";
import {Button, Flex, Group, Progress, Skeleton, Stack, Text, UnstyledButton} from "@mantine/core";
import {IconArrowRight, IconClock, IconFileDescription, IconTrash, IconTrophy, IconUser} from "@tabler/icons-react";
import {Link} from "@tanstack/react-router";
import {useDeletePractice, usePracticeElegible} from "../../hooks/hooks.tsx";
import {PracticeSetSummary} from "../../types/PracticeSet.tsx";
import {useTranslation} from "react-i18next";
import HandleComponent from "../HandleComponent.tsx";
import {MantineReactTable, MRT_ColumnDef, useMantineReactTable} from "mantine-react-table";
import {MemberSummary} from "../../types/MemberSummary.tsx";
import {useAuth} from "../../context/AuthProvider.tsx";

interface PracticeSetProps {
    practiceSets: PracticeSetSummary[] | undefined;
}

const PracticeListTable = ({practiceSets}: PracticeSetProps) => {
    const {t} = useTranslation();
    const auth = useAuth();
    const mutation = usePracticeElegible();
    const removeMutation = useDeletePractice();

    const renderDifficulty = (level: number) => {
        const color = level <= 1 ? "teal" : level <= 2 ? "green" : level <= 3 ? "yellow" : level <= 4 ? "orange" : level <= 5 ? "violet" : level <= 6 ? "red" : "black";
        return (
            <Group gap={4}>
                <Progress value={level * (100 / 7)} color={color} size="sm" style={{flex: 1}}/>
                <Text size="xs" fw={600} c={color}>Lv.{level}</Text>
            </Group>
        );
    };

    const handleEnter = (id: number) => {
        mutation.mutate({practiceId: id});
    };

    const handleRemove = (id: number) => {
        removeMutation.mutate({practiceId: id});
    }

    const columns = useMemo<MRT_ColumnDef<PracticeSetSummary>[]>(
        () => [
            {
                accessorKey: 'id',
                header: '#',
                Cell: ({cell}) => <Text size="sm">{cell.getValue() as string}</Text>,
                size: 0,
            },
            {
                accessorKey: 'name',
                header: t('제목'),
                Cell: ({cell, row}) => {
                    const author = row.original.author
                    const isAuthor = author.handle === auth.member?.handle
                    return (
                        <Flex align="center" gap="xs">
                            <Text size="sm">
                                {cell.getValue() as string}
                            </Text>
                            {isAuthor &&
                                <UnstyledButton onClick={() => handleRemove(row.original.id)}>
                                    <IconTrash size={16}/>
                                </UnstyledButton>}
                        </Flex>
                    )
                },
            },
            {
                accessorKey: 'author',
                header: t('저자'),
                Cell: ({cell}) => <HandleComponent member={cell.getValue() as MemberSummary}/>,
                size: 0,
            },
            {
                accessorKey: 'difficulty',
                header: t('난이도'),
                Cell: ({cell}) => renderDifficulty(cell.getValue() as number),
                size: 120,
            },
            {
                accessorKey: 'num_missions',
                header: t('문제 수'),
                Cell: ({cell}) => (
                    <Group gap={4}>
                        <IconFileDescription size={16}/>
                        <Text size="sm">{cell.getValue() as number}문제</Text>
                    </Group>
                ),
                size: 90,
            },
            {
                accessorKey: 'duration',
                header: t('시간'),
                Cell: ({cell}) => (
                    <Group gap={4}>
                        <IconClock size={16}/>
                        <Text size="sm">{Math.floor((cell.getValue() as number) / 60)}시간</Text>
                    </Group>
                ),
                size: 90,
            },
            {
                accessorKey: 'num_members',
                header: t('참여 인원'),
                Cell: ({cell}) => (
                    <Group gap={4}>
                        <IconUser size={16}/>
                        <Text size="sm">{cell.getValue() as number}명</Text>
                    </Group>
                ),
                size: 45,
            },
            {
                accessorKey: 'actions',
                header: '',
                columnDefType: 'display',
                Cell: ({row}) => {
                    const ps = row.original;
                    return (
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
                            {ps.your_room_id ? (
                                <Link to={`/rooms/${ps.your_room_id}`}>
                                    <Button
                                        variant="light"
                                        size="xs"
                                        rightSection={<IconArrowRight size={16}/>}
                                        fullWidth
                                    >
                                        {t('입장하기')}
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    variant="light"
                                    onClick={() => handleEnter(ps.id)}
                                    size="xs"
                                    rightSection={<IconArrowRight size={16}/>}
                                    fullWidth
                                >
                                    {t('시작하기')}
                                </Button>
                            )}
                        </Stack>
                    );
                },
                size: 0,
            },
        ],
        [t]
    );

    const table = useMantineReactTable({
        columns,
        data: practiceSets || [],
        enableColumnActions: false,
        enableColumnFilters: false,
        enableDensityToggle: false,
        // enablePagination: false,
        // enableSorting: false,
        mantineTableProps: {
            highlightOnHover: false,
            striped: 'odd',
            // withColumnBorders: true,
            withRowBorders: true,
            // withTableBorder: true,
        },
    })

    if (!practiceSets || auth.loading) {
        return (
            <Stack>
                {Array.from({length: 3}).map((_, index) => (
                    <Skeleton key={index} height={80} radius="sm"/>
                ))}
            </Stack>
        );
    }


    return (
        <MantineReactTable
            table={table}

        />
    );
};

export default PracticeListTable;
