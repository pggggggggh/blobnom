import {Button, Card, Collapse, Container, Paper, Stack, Text, Title} from "@mantine/core";
import {useContestDetail, useRegisterContest, useUnregisterContest} from "../../hooks/hooks.tsx";
import {Route} from "../../routes/contests/$contestId.tsx";
import React, {useState} from "react";
import dayjs from "dayjs";
import {Link} from "@tanstack/react-router";
import ContestLeaderboardComponent from "../../components/Contest/ContestLeaderboardComponent.tsx";
import ContestDetailsCards from "../../components/Contest/ContestDetailsCards.tsx";
import HandleComponent from "../../components/HandleComponent.tsx";
import {KeyboardArrowDown, KeyboardArrowUp} from "@mui/icons-material";

const ContestDetailsPage = () => {
    const {contestId} = Route.useParams();
    const {data: contestDetail, isLoading, error} = useContestDetail(parseInt(contestId));
    const [opened, setOpened] = useState(false);

    const mutation_register = useRegisterContest();
    const mutation_unregister = useUnregisterContest();

    if (isLoading || error || !contestDetail) return <div></div>;

    return (
        <Container size="lg" mb="xl">
            <Card padding="lg">
                <Stack align="center" justify="center" gap="xs">
                    <Title>🏆</Title>
                    <Title order={2} ta="center">{contestDetail.name}</Title>
                    {contestDetail.desc && <Text size="sm" className="text-gray-300">{contestDetail.desc}</Text>}
                    <Text>
                        {dayjs(contestDetail.starts_at).format('YYYY-MM-DD HH:mm')} ~ {dayjs(contestDetail.ends_at).format('YYYY-MM-DD HH:mm')}
                    </Text>
                    {contestDetail.is_ended ? (
                        <Text>대회가 종료되었습니다.</Text>
                    ) : !contestDetail.is_user_registered ? (
                        !contestDetail.is_started && (
                            <Button
                                onClick={() => mutation_register.mutate({contestId})}
                                loading={mutation_register.isPending}
                            >
                                참가하기
                            </Button>
                        )
                    ) : contestDetail.user_room_id ? (
                        <Link to="/rooms/$roomId" params={{roomId: contestDetail.user_room_id.toString()}}>
                            <Button>입장하기</Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={() => mutation_unregister.mutate({contestId})}
                            loading={mutation_unregister.isPending}
                        >
                            취소하기
                        </Button>
                    )}
                </Stack>
            </Card>

            <Card className="mt-4" padding="lg">
                <div className="flex justify-between items-center">
                    <Text size="lg" fw={500}>
                        참가자 목록 ({contestDetail.num_participants}명)
                    </Text>
                    <Button
                        variant="subtle"
                        onClick={() => setOpened((o) => !o)}
                        rightSection={opened ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
                    >
                        {opened ? '접기' : '펼치기'}
                    </Button>
                </div>

                <Collapse in={opened} className="mt-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {contestDetail.participants.map((participant, index) => (
                            <Paper
                                key={index}
                                className="p-2 text-center hover:bg-zinc-800 transition-colors duration-200"
                                shadow="xs"
                            >
                                <Text size="sm" className="truncate">
                                    <HandleComponent user={participant} linkToProfile={true}/>
                                </Text>
                            </Paper>
                        ))}
                    </div>
                </Collapse>
            </Card>

            {contestDetail.room_details && <ContestLeaderboardComponent room_details={contestDetail.room_details}/>}
            <ContestDetailsCards contestDetails={contestDetail}/>
        </Container>
    );
};

export default ContestDetailsPage;
