import React from 'react';
import {Card, Flex, Grid, Group, Stack, Text, Title} from "@mantine/core";
import {Link} from "@tanstack/react-router";
import HandleComponent from "./HandleComponent.tsx";
import {RoomDetail} from "../types/RoomDetail.tsx";

const ContestLeaderboardComponent = ({room_details}) => {
    return (
        <Card className="p-4" bg="none">
            <Grid>
                {Object.values(room_details).map((room: RoomDetail, roomIdx) => (
                    <Grid.Col key={room.id} span={{base: 12, md: 6}}>
                        <Card className="bg-gray-900 shadow-lg">
                            <Stack gap="md">
                                <Group justify="center" className="border-b border-gray-700 pb-4">
                                    <Link to={`/rooms/${room.id}/`}>
                                        <Title order={3}
                                               className="text-gray-100 hover:text-blue-400 transition-colors">
                                            Room {roomIdx + 1}
                                        </Title>
                                    </Link>
                                </Group>

                                <div className="">
                                    {room.team_info.map((team, index) => {
                                        const rankColors = [
                                            "text-red-500",
                                            "text-orange-500",
                                            "text-yellow-500",
                                            "text-purple-500",
                                            "text-blue-500",
                                            "text-teal-500",
                                            "text-green-500",
                                            "text-gray-500",
                                        ];

                                        const rankClass = team.total_solved_count > 0 ? rankColors[index] : "text-gray-400";

                                        return (
                                            <div
                                                key={index}
                                                className={`
                                                    ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}
                                                    hover:bg-gray-700
                                                    transition-colors
                                                    
                                                    p-2
                                                `}
                                            >
                                                <Group gap="xs" align="center">
                                                    <Flex w={30} justify="center" className="">
                                                        <Text size="lg" className={`font-extrabold ${rankClass}`}>
                                                            {team.total_solved_count === 0 ? "-" : `#${index + 1}`}
                                                        </Text>
                                                    </Flex>

                                                    <div className="flex-grow h-1/3">
                                                        <HandleComponent user={team.users[0].user}/>
                                                    </div>

                                                    <Text
                                                        size="sm"
                                                        className="bg-gray-700 px-2 py-1 rounded-full text-gray-300"
                                                    >
                                                        {team.total_solved_count}
                                                    </Text>
                                                </Group>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Stack>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
        </Card>
    );
}

export default ContestLeaderboardComponent;