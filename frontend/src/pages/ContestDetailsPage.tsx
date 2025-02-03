import {Button, Card, Container, Stack, Text, Title} from "@mantine/core";
import {useContestDetail, useRegisterContest, useUnregisterContest} from "../hooks/hooks.tsx";
import {Route} from "../routes/contests/$contestId.tsx";
import React from "react";
import dayjs from "dayjs";
import {Link} from "@tanstack/react-router";
import ContestLeaderboardComponent from "../components/Contest/ContestLeaderboardComponent.tsx";
import ContestDetailsCards from "../components/Contest/ContestDetailsCards.tsx";

const ContestDetailsPage = () => {
    const {contestId} = Route.useParams()
    const {data: contestDetail, isLoading, error} = useContestDetail(parseInt(contestId));

    const mutation_register = useRegisterContest()
    const mutation_unregister = useUnregisterContest()


    if (isLoading || error || !contestDetail) return (<div></div>);

    return (
        <Container size="lg" mb="xl">
            <Card padding="lg">
                <Stack align="center" justify="center" gap="xs">
                    <Title>🏆</Title>
                    <Title order={2} ta="center">{contestDetail.name}</Title>
                    <Text>
                        {dayjs(contestDetail.starts_at).format('YYYY-MM-DD HH:mm')} ~ {dayjs(contestDetail.ends_at).format('YYYY-MM-DD HH:mm')}
                    </Text>
                    {
                        contestDetail.is_ended ?
                            <Text>
                                대회가 종료되었습니다.
                            </Text>
                            :

                            (!contestDetail.is_user_registered ?
                                (
                                    !contestDetail.is_started &&
                                    <Button
                                        onClick={() => {
                                            mutation_register.mutate({contestId: contestId})
                                        }}
                                        loading={mutation_register.isPending}>
                                        참가하기
                                    </Button>
                                )
                                :
                                (contestDetail.user_room_id ?
                                    <Link
                                        to="/rooms/$roomId"
                                        params={{
                                            roomId: contestDetail.user_room_id.toString()
                                        }}
                                    >
                                        <Button
                                        >
                                            입장하기
                                        </Button>
                                    </Link>
                                    :
                                    <Button
                                        onClick={() => {
                                            mutation_unregister.mutate({contestId: contestId})
                                        }}
                                        loading={mutation_unregister.isPending}>
                                        취소하기
                                    </Button>))
                    }
                </Stack>
            </Card>

            {contestDetail.room_details &&
                <ContestLeaderboardComponent room_details={contestDetail.room_details}/>}

            <ContestDetailsCards contestDetails={contestDetail}/>
        </Container>
    );
};

export default ContestDetailsPage;