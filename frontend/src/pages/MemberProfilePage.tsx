import {useMemberDetail} from "../hooks/hooks.tsx";
import {Container, Title} from "@mantine/core";
import {Route} from "../routes/members/$handle.tsx";
import RatingChartComponent from "../components/RatingChartComponent.tsx";

const MemberProfilePage = () => {
    const {handle} = Route.useParams()
    const {data: memberDetails, isLoading, error} = useMemberDetail(handle);

    console.log(memberDetails);


    if (isLoading || error || !memberDetails) return (<div></div>);

    return (
        <Container size="md">
            <div>
                <Title mb="xl">
                    {handle}
                </Title>
                <Title order={2}>
                    해결한 문제 수
                </Title>
                <Title order={3} mb="xl">
                    {memberDetails.num_solved_missions}
                </Title>
                <RatingChartComponent contestHistory={memberDetails.contest_history}/>
            </div>
        </Container>
    )
}

export default MemberProfilePage;