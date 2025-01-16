import {Box, Button, Card, Container, Grid, List, Stack, Text, Title} from "@mantine/core";
import {useContestDetail, useRegisterContest, useUnregisterContest} from "../hooks/hooks.tsx";
import {Route} from "../routes/contests/$contestId.tsx";
import React from "react";
import dayjs from "dayjs";

const ContestDetailsPage = () => {
    const {contestId} = Route.useParams()
    const {data: contestDetail, isLoading, error} = useContestDetail(parseInt(contestId));

    const mutation_register = useRegisterContest()
    const mutation_unregister = useUnregisterContest()


    if (isLoading || error || !contestDetail) return (<div></div>);

    return (
        <Container size="lg">
            <Grid>
                <Grid.Col span={{base: 12, md: 8}}>
                    <Card padding="lg" mb="lg">
                        <Stack align="center" justify="center" gap="xs">
                            <Title>🏆</Title>
                            <Title order={2}>{contestDetail.name}</Title>
                            <Text>
                                {dayjs(contestDetail.starts_at).format('YYYY-MM-DD HH:mm')} ~ {dayjs(contestDetail.ends_at).format('YYYY-MM-DD HH:mm')}
                            </Text>
                            {!contestDetail.is_user_registered ?
                                <Button
                                    onClick={() => {
                                        mutation_register.mutate({contestId: contestId})
                                    }}
                                    loading={mutation_register.isPending}>
                                    참가하기
                                </Button>
                                :
                                <Button
                                    onClick={() => {
                                        mutation_unregister.mutate({contestId: contestId})
                                    }}
                                    loading={mutation_unregister.isPending}>
                                    취소하기
                                </Button>
                            }
                        </Stack>
                    </Card>

                    <Card shadow="sm" padding="lg">
                        <Stack>
                            <Box>
                                <Title order={3} mb="xs">
                                    대회 정보
                                </Title>
                                <List spacing="sm" size="sm" withPadding>
                                    <List.Item>solved.ac 쿼리 : {contestDetail.query} + 각 방 참가자들이 시도하지 않은 문제</List.Item>
                                    <List.Item>각 방에 최대 {contestDetail.players_per_room}명의
                                        인원이 배정되어 {contestDetail.missions_per_room}문제를 풀게 됩니다.</List.Item>
                                    <List.Item>이 대회의 결과는 레이팅에 반영되지 않습니다.</List.Item>
                                </List>
                            </Box>
                            <Box>
                                <Title order={3} mb="xs">
                                    대회 규칙
                                </Title>
                                <List spacing="sm" size="sm" withPadding>
                                    <List.Item>대회 시작 전, 'BOJ 설정 - 보기 - solved.ac 티어'를 '보지 않기'로 설정해주세요.</List.Item>
                                    <List.Item>해당 문제의 풀이를 직접 검색하는 것을 제외한 모든 검색이 허용됩니다.</List.Item>
                                    <List.Item>해당 문제의 정답 소스코드를 제외한 모든 소스코드의 복사/붙여넣기가 허용됩니다.</List.Item>
                                    <List.Item>타인과 문제에 대한 어떤 논의도 금지됩니다.</List.Item>
                                </List>
                            </Box>
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{base: 12, md: 4}}>
                    <Card shadow="sm" padding="lg">
                        <Title order={4} mb="md">
                            참가자
                        </Title>
                        <Stack align="center" gap="xs">
                            {
                                contestDetail.participants?.map((participant, idx) => (
                                    <Text key={idx}>
                                        {participant}
                                    </Text>
                                ))
                            }
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>
        </Container>
    );
};

export default ContestDetailsPage;