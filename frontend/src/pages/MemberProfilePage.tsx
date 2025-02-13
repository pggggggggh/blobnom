import {useMemberDetail} from "../hooks/hooks.tsx";
import {Anchor, Avatar, Card, Container, Group, Text, Title} from "@mantine/core";
import {Route} from "../routes/members/$handle.tsx";
import RatingChartComponent from "../components/RatingChartComponent.tsx";
import {getRatingColor} from "../utils/MiscUtils.tsx";
import React from "react";
import HandleComponent from "../components/HandleComponent.tsx";
import PlatformIcons from "../constants/PlatformIcons.tsx";
import {Platform} from "../types/Platforms.tsx";

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {Object.entries(memberDetails.user_summary.accounts).map(([key, value]) => (
                    <Card shadow="sm" padding="md" radius="md" key={key} className="flex items-center">
                        <Group className="w-full">
                            {PlatformIcons[key]}
                            <div>
                                <Text size="sm" className="text-gray-300">
                                    {key.toUpperCase()} 계정
                                </Text>
                                <Anchor
                                    className="no-underline text-inherit"
                                    target="_blank"
                                    href={
                                        key === Platform.BOJ ? `https://www.acmicpc.net/user/${value}` : `https://codeforces.com/profile/${value}`
                                    }>
                                    <Text className="text-lg font-semibold">{value}</Text>
                                </Anchor>
                            </div>
                        </Group>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
