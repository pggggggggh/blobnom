import {useMemberDetail} from "../hooks/hooks.tsx";
import {Avatar, Card, Container, Text, Title} from "@mantine/core";
import {Route} from "../routes/members/$handle.tsx";
import RatingChartComponent from "../components/RatingChartComponent.tsx";
import {getRatingColor} from "../utils/MemberUtils.tsx";
import React from "react";
import HandleComponent from "../components/HandleComponent.tsx";

const MemberProfilePage = () => {
    const {handle} = Route.useParams();
    const {data: memberDetails, isLoading, error} = useMemberDetail(handle);

    if (isLoading || error || !memberDetails) return;

    return (
        <Container size="md" className="py-10">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center mb-4">
                {/*<Avatar src={memberDetails.avatar_url} size={120} radius={60} className="mb-4"/>*/}
                <Avatar
                    name={memberDetails.handle}
                    color="initials"
                    size={80} radius={60} className="mb-4"
                />
                <Title className="text-3xl font-bold">
                    <HandleComponent user={memberDetails.user_summary}/>의 프로필
                </Title>
                <Text size="md" className="text-gray-600 mt-2">
                    {memberDetails.bio || "사용자의 자기소개가 없습니다."}
                </Text>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card shadow="sm" padding="lg" radius="md" className="text-center">
                    <Text size="lg" className="">해결한 문제 수</Text>
                    <Text className="text-2xl font-bold">{memberDetails.num_solved_missions}</Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" className="text-center">
                    <Text size="lg" className="">해결 업적 수</Text>
                    <Text className="text-2xl font-bold">0</Text>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" className="text-center">
                    <Text size="lg" className="">레이팅</Text>
                    <Text className={`text-2xl font-bold ${getRatingColor(memberDetails.rating)}`}>
                        {memberDetails.rating}
                    </Text>
                </Card>
            </div>

            {/* Chart Section */}
            <Card shadow="sm" padding="lg" radius="md" className="mt-5">
                <Text size="lg" className="">레이팅 변화</Text>
                <RatingChartComponent contestHistory={memberDetails.contest_history}/>
            </Card>
        </Container>
    );
};

export default MemberProfilePage;
