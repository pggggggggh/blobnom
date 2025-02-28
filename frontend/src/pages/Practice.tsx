import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {useDebouncedValue} from "@mantine/hooks";
import {
    ActionIcon,
    Badge,
    Button,
    Group,
    Pagination,
    Progress,
    Skeleton,
    Stack,
    Table,
    Tabs,
    Text,
    Title
} from "@mantine/core";
import {IconArrowRight, IconClock, IconCode, IconFileDescription, IconStar, IconStarFilled} from '@tabler/icons-react';
import WithSidebar from "../components/Layout/WithSidebar.tsx";

// 연습 모드 문제 셋 타입 정의
interface ProblemSet {
    id: string;
    title: string;
    source: string;
    difficulty: number;
    problemCount: number;
    timeLimit: number;
    completedCount: number;
    bestRank?: number;
    tags: string[];
    createdAt: string;
    isFavorite: boolean;
}

const dummyProblemSets: ProblemSet[] = [
    {
        id: "ps1",
        title: "코딩 테스트 모의고사 1회",
        source: "KOI",
        difficulty: 2,
        problemCount: 4,
        timeLimit: 120,
        completedCount: 1253,
        bestRank: 32,
        tags: ["구현", "그리디", "수학"],
        createdAt: "2024-01-15T00:00:00Z",
        isFavorite: true
    },
    {
        id: "ps2",
        title: "유사코 2024 Winter #1",
        source: "USACO",
        difficulty: 4,
        problemCount: 5,
        timeLimit: 240,
        completedCount: 876,
        tags: ["그래프", "DP", "이분탐색"],
        createdAt: "2024-02-10T00:00:00Z",
        isFavorite: false
    },
    {
        id: "ps3",
        title: "KOI 2023 중등부 기출",
        source: "KOI",
        difficulty: 3,
        problemCount: 4,
        timeLimit: 180,
        completedCount: 967,
        bestRank: 15,
        tags: ["그래프", "트리", "수학"],
        createdAt: "2024-01-20T00:00:00Z",
        isFavorite: true
    },
    {
        id: "ps4",
        title: "USACO Silver 2023 Dec",
        source: "USACO",
        difficulty: 3,
        problemCount: 3,
        timeLimit: 180,
        completedCount: 542,
        tags: ["DP", "그리디", "구현"],
        createdAt: "2023-12-25T00:00:00Z",
        isFavorite: false
    },
    {
        id: "ps5",
        title: "KOI 2022 고등부 기출",
        source: "KOI",
        difficulty: 5,
        problemCount: 4,
        timeLimit: 240,
        completedCount: 321,
        bestRank: 87,
        tags: ["세그먼트 트리", "최단경로", "이분탐색"],
        createdAt: "2023-11-05T00:00:00Z",
        isFavorite: false
    },
];

const PracticeListComponent = () => {
    const {t} = useTranslation();
    const [problemSets, setProblemSets] = useState<ProblemSet[]>(dummyProblemSets);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 400);
    const [filter, setFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    // 난이도 표시를 위한 함수
    const renderDifficulty = (level: number) => {
        const color = level <= 2 ? "green" : level <= 3 ? "yellow" : level <= 4 ? "orange" : "red";
        return (
            <Group gap={4}>
                <Progress
                    value={level * 20}
                    color={color}
                    size="sm"
                    w={60}
                />
                <Text size="xs" fw={600} c={color}>Lv.{level}</Text>
            </Group>
        );
    };

    // 문제셋을 필터링하는 함수
    const filteredProblemSets = problemSets.filter(ps => {
        const matchesSearch = ps.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            ps.source.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            ps.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));

        if (filter === "all") return matchesSearch;
        if (filter === "favorites") return matchesSearch && ps.isFavorite;
        if (filter === "completed") return matchesSearch && ps.bestRank !== undefined;
        if (filter === "koi") return matchesSearch && ps.source === "KOI";
        if (filter === "usaco") return matchesSearch && ps.source === "USACO";

        return matchesSearch;
    });

    // 페이지네이션을 위한 현재 페이지 문제셋
    const paginatedProblemSets = filteredProblemSets.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // 즐겨찾기 토글 함수
    const toggleFavorite = (id: string) => {
        setProblemSets(prev =>
            prev.map(ps => ps.id === id ? {...ps, isFavorite: !ps.isFavorite} : ps)
        );
    };

    return (
        <>
            <Title>연습</Title>
            <Text w="90%" c="dimmed" mb="md">
                실제 대회나 코딩 테스트 환경처럼, 정해진 문제 셋을 풀어볼 수 있습니다.
            </Text>
            <Stack gap="md">

                <Tabs defaultValue="all" onChange={(value) => setFilter(value || "all")}>
                    <Tabs.List>
                        <Tabs.Tab value="all" leftSection={<IconCode size={16}/>}>{t('전체')}</Tabs.Tab>
                    </Tabs.List>
                </Tabs>


                {isLoading ? (
                    <Stack>
                        {Array.from({length: 3}).map((_, index) => (
                            <Skeleton key={index} height={80} radius="sm"/>
                        ))}
                    </Stack>
                ) : (
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{width: '40px'}}></Table.Th>
                                <Table.Th>{t('제목')}</Table.Th>
                                <Table.Th>{t('방식')}</Table.Th>
                                <Table.Th>{t('난이도')}</Table.Th>
                                <Table.Th>{t('문제 수')}</Table.Th>
                                <Table.Th>{t('시간')}</Table.Th>
                                <Table.Th>{t('내 순위')}</Table.Th>
                                <Table.Th>{t('')}</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedProblemSets.length > 0 ? (
                                paginatedProblemSets.map((ps) => (
                                    <Table.Tr key={ps.id}>
                                        <Table.Td>
                                            <ActionIcon
                                                color={ps.isFavorite ? "yellow" : "gray"}
                                                variant="subtle"
                                                onClick={() => toggleFavorite(ps.id)}
                                            >
                                                {ps.isFavorite ? <IconStarFilled size={18}/> : <IconStar size={18}/>}
                                            </ActionIcon>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{ps.title}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge fullWidth variant="light"
                                                   color={ps.source === "KOI" ? "cyan" : "violet"}>
                                                {ps.source}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>{renderDifficulty(ps.difficulty)}</Table.Td>
                                        <Table.Td>
                                            <Group gap={4}>
                                                <IconFileDescription size={16}/>
                                                <Text size="sm">{ps.problemCount}문제</Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap={4}>
                                                <IconClock size={16}/>
                                                <Text
                                                    size="sm">{Math.floor(ps.timeLimit / 60)}시간 </Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            {ps.bestRank ? (
                                                <Text size="sm" fw={600}>#{ps.bestRank}</Text>
                                            ) : (
                                                <Text size="xs" c="dimmed">{t('')}</Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Button
                                                variant="light"
                                                size="xs"
                                                rightSection={<IconArrowRight size={16}/>}
                                                fullWidth
                                            >
                                                {ps.bestRank ? t('입장하기') : t('참가하기')}
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={8}>
                                        <Text ta="center" py="lg" c="dimmed">
                                            {t('noProblemSetsFound')}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                )}

                <Group position="center" mt="md">
                    <Pagination
                        total={Math.ceil(filteredProblemSets.length / itemsPerPage)}
                        value={page}
                        onChange={setPage}
                        siblings={1}
                    />
                </Group>

            </Stack>
        </>
    );
};

const PracticePage = () => (
    <WithSidebar>
        <PracticeListComponent/>
    </WithSidebar>
)

export default PracticePage;