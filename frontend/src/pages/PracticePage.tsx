import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {Badge, Card, Container, Group, Pagination, SimpleGrid, Stack, Tabs, Text, Title} from "@mantine/core";
import {IconCode, IconStairs} from '@tabler/icons-react';
import WithSidebar from "../components/Layout/WithSidebar.tsx";
import {usePracticeList} from "../hooks/hooks.tsx";
import PracticeListTable from "../components/Practice/PracticeListTable.tsx";

const LevelInfoCards = () => {
    const levelInfo = [
        {
            "level": 1,
            "target": "코딩 테스트 입문",
            "description": "기업 코딩 테스트 수준의 기본 문제들로, 코딩 테스트에 처음 도전하는 분들이 기초를 다질 수 있습니다."
        },
        {
            "level": 2,
            "target": "코딩 테스트 도전",
            "description": "기업 코딩 테스트 중에서도 어려운 문제들을 통해 한 단계 더 높은 실력을 요구하는 문제들로 구성되어 있습니다."
        },
        {
            "level": 3,
            "target": "중급자",
            "description": "다양한 알고리즘 문제 해결 능력을 평가하는 문제들로, 기본기를 탄탄히 다진 분들을 위한 단계입니다."
        },
        {
            "level": 4,
            "target": "정보올림피아드 준비",
            "description": "정보 올림피아드 대회에서 출제될 수 있는 수준의 복잡하고 도전적인 문제들을 다룹니다."
        },
        {
            "level": 5,
            "target": "PS 전문가",
            "description": "PS 전문가들을 위한 각종 캠프 수준의 고난이도 문제들로, 깊이 있는 문제 해결 전략과 최적화 능력을 평가합니다."
        }
    ]

    return (
        <Container size="lg" mt="md" mb="sm" p={0}>
            <Group align="center" gap="xs" mb="xs">
                <IconStairs size={16}/>
                <Text fw={500}>레벨 안내</Text>
            </Group>
            <SimpleGrid cols={{base: 1, sm: 2, md: 3}} spacing="sm">
                {levelInfo.map((info) => (
                    <Card key={info.level} withBorder shadow="sm" padding="md">
                        <Group justify="space-between" mb="xs">
                            <Badge size="sm" variant="filled"
                                   color={info.level === 5 ? "red" : info.level === 4 ? "orange" : info.level === 3 ? "yellow" : info.level === 2 ? "blue" : "green"}>
                                레벨 {info.level}
                            </Badge>
                            <Text fw={500}>{info.target}</Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                            {info.description}
                        </Text>
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    );
};

const PracticeListComponent = () => {
    const {t} = useTranslation();
    const {data: practiceSets, isLoading, error} = usePracticeList();
    const [page, setPage] = useState(1);


    return (
        <>
            <Title>연습</Title>
            <Text c="dimmed" mb="md">
                혼자서 실제 대회나 코딩 테스트 환경처럼 정해진 문제 셋을 풀어볼 수 있습니다. 인접한 칸 수가 아닌, 푼 문제수와 걸린 시간의 총합으로 순위를 가르며,
                익명으로 진행되어 부담없이 연습할 수 있습니다.
            </Text>

            {/*<LevelInfoCards/>*/}

            <Stack gap="md">
                <Tabs defaultValue="all">
                    <Tabs.List>
                        <Tabs.Tab value="all" leftSection={<IconCode size={16}/>}>{t('전체')}</Tabs.Tab>
                    </Tabs.List>
                </Tabs>

                <PracticeListTable practiceSets={practiceSets}/>

                <Group justify="center" mt="md">
                    <Pagination
                        total={1}
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