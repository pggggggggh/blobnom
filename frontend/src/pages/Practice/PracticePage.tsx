import React from 'react';
import {useTranslation} from "react-i18next";
import {Badge, Box, Card, Container, Group, SimpleGrid, Stack, Tabs, Text, Title} from "@mantine/core";
import {IconCode, IconHexagonPlus2} from '@tabler/icons-react';
import WithSidebar from "../../components/Layout/WithSidebar.tsx";
import {usePracticeList} from "../../hooks/hooks.tsx";
import PracticeListTable from "../../components/Practice/PracticeListTable.tsx";
import {Link} from "@tanstack/react-router";

const LevelInfoCards = () => {
    const levelInfo = [
        {
            "level": 1,
            "target": "기본 문제",
            "description": "아직 문제해결에 익숙하지 않은 분들을 위한 연습셋입니다. solved.ac 기준 Bronze 문제 위주로 구성됩니다."
        },
        {
            "level": 2,
            "target": "코딩 테스트 대비",
            "description": "기업 코딩 테스트 수준의 연습셋입니다. solved.ac 기준 Silver 중위 ~ Gold 하위 문제 위주로 구성됩니다."
        },
        {
            "level": 3,
            "target": "코딩 테스트 도전",
            "description": "기업 코딩 테스트 중에서도 보다 높은 실력을 요구하는 연습셋입니다. solved.ac 기준 Silver 상위 ~ Gold 중위 문제 위주로 구성됩니다."
        },
        {
            "level": 4,
            "target": "PS 중급자",
            "description": "코딩 테스트 범위를 벗어나, 본격적으로 문제해결의 재미를 느끼기 위한 연습셋입니다. solved.ac 기준 Gold 하위 ~ Gold 상위 문제 위주로 구성됩니다."
        },
        {
            "level": 5,
            "target": "올림피아드",
            "description": "각종 정보올림피아드 수준의 실력을 요구하는 연습셋입니다. solved.ac 기준 Gold 중위 ~ Platinum 중위 문제 위주로 구성됩니다."
        },
        {
            "level": 6,
            "target": "PS 전문가",
            "description": "PS 전문가들을 위한 연습셋입니다. solved.ac 기준 Platinum 중위 ~ Diamond 하위 문제 위주로 구성됩니다."
        },
        {
            "level": 7,
            "target": "신",
            "description": "신이 아니라면 도전하지 마시기 바랍니다. solved.ac 기준 Diamond 중위를 넘는 문제 위주로 구성된 연습셋입니다."
        }
    ]

    return (
        <Container size="lg" mb="sm" p={0}>
            <SimpleGrid cols={{base: 1, sm: 2, md: 3}} spacing="sm">
                {levelInfo.map((info) => (
                    <Card key={info.level} withBorder shadow="sm" padding="md">
                        <Group justify="space-between" mb="xs">
                            <Badge size="sm" variant="filled"
                                   color={info.level == 1 ? "teal" : info.level <= 2 ? "green" : info.level <= 3 ? "yellow" : info.level <= 4 ? "orange" : info.level <= 5 ? "violet" : info.level <= 6 ? "red" : "black"}>
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


    return (
        <>
            <Title>연습</Title>
            <Text c="dimmed" mb="md">
                혼자서 실제 대회나 코딩 테스트 환경처럼 정해진 문제 셋을 풀어볼 수 있습니다. 인접한 칸 수가 아닌, 푼 문제수와 걸린 시간의 총합으로 순위를 가르며,
                익명으로 진행되어 부담없이 연습할 수 있습니다.
            </Text>

            <LevelInfoCards/>

            <Stack gap="md">
                <Tabs defaultValue="all">
                    <Tabs.List>
                        <Tabs.Tab value="all" leftSection={<IconCode size={16}/>}>{t('전체')}</Tabs.Tab>
                        <Box ml="auto">
                            <Link to="/practices/create">
                                <Tabs.Tab value="new"
                                          leftSection={<IconHexagonPlus2 size={16}/>}>
                                    {t('새로 만들기')}
                                </Tabs.Tab>
                            </Link>
                        </Box>
                    </Tabs.List>

                </Tabs>

                <PracticeListTable practiceSets={practiceSets}/>

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