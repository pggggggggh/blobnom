// src/components/TeamSelector.tsx
import React, {ChangeEvent, useEffect, useState} from 'react';
import {Box, Button, Card, Flex, Group, Input, Switch, TagsInput, Text} from '@mantine/core';
import {Option, Team} from '../types';
import {useAuth} from "../../context/AuthProvider.tsx";

const MAX_TEAMS = 4;
const MIN_TEAMS = 2;

const transformToOptions = (items: string[]): Option[] =>
    items.map((item) => ({value: item, label: item}));

const TeamSelector = ({handleProps, teamModeProps}: {
    handleProps: any,
    teamModeProps: any
}) => {
    const auth = useAuth();

    const [individualParticipants, setIndividualParticipants] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([[], []]);

    useEffect(() => {
        if (auth?.member) {
            setIndividualParticipants([auth.member.handle]);
        }
    }, [auth?.member]);

    const handleIndividualChange = (tags: string[]) => {
        setIndividualParticipants(tags.map(tag => tag.toLowerCase()));
    };

    const handleTeamChange = (index: number, tags: string[]) => {
        setTeams((prevTeams) => {
            const updatedTeams = [...prevTeams];
            updatedTeams[index] = tags.map(tag => tag.toLowerCase());
            return updatedTeams;
        });
    };

    const addTeam = () => {
        setTeams((prevTeams) => {
            if (prevTeams.length < MAX_TEAMS) {
                return [...prevTeams, []];
            }
            return prevTeams;
        });
    };

    const removeTeam = () => {
        setTeams((prevTeams) => {
            if (prevTeams.length > MIN_TEAMS) {
                return prevTeams.slice(0, prevTeams.length - 1);
            }
            return prevTeams;
        });
    };

    const toggleMode = (event: ChangeEvent<HTMLInputElement>) => {
        const {checked} = event.target;
        teamModeProps.onChange(checked);
        if (checked) {
            setIndividualParticipants([]);
            setTeams([[], []]);
        } else {
            setTeams([[], []]);
            setIndividualParticipants(auth?.member ? [auth.member.handle] : []);
        }
    };

    useEffect(() => {
        const handleTeam: { [key: string]: number } = {};
        if (teamModeProps.value) {
            teams.map((teams: string[], idx: number) => {
                teams.forEach((handle: string) => {
                    handleTeam[handle] = idx;
                })
            });
            handleProps.onChange(handleTeam);
        } else {
            individualParticipants.map((handle: string, idx: number) => {
                handleTeam[handle] = idx;
            })
            handleProps.onChange(handleTeam);
        }
    }, [individualParticipants, teamModeProps.value, teams]);

    const getTeamWidth = (count: number): string => {
        switch (count) {
            case 2:
                return 'calc((100% - 16px) / 2)';
            case 3:
                return 'calc((100% - 32px) / 3)';
            case 4:
                return 'calc((100% - 48px) / 4)';
            default:
                return '100%';
        }
    };

    return (
        <Flex justify="space-between">
            <Input.Wrapper label="모드" mr="xl" className="grow-0 min-w-20">
                <Switch
                    checked={teamModeProps.value}
                    onChange={toggleMode}
                    label={teamModeProps.value ? '팀전' : '개인전'}
                    aria-label="팀 모드와 개인 모드 전환"
                />
            </Input.Wrapper>
            <Input.Wrapper label="참가자 선택" className="grow">
                {!teamModeProps.value ? (
                    <Card shadow="sm"
                          withBorder>
                        <TagsInput
                            data={transformToOptions(individualParticipants)}
                            value={individualParticipants}
                            onChange={handleIndividualChange}
                            placeholder="닉네임 입력"
                            variant="unstyled"
                            onCreate={(query: string) => {
                                query = query.toLowerCase()
                                setIndividualParticipants((current) => [...current, query]);
                                return query;
                            }}
                            splitChars={[',', ' ', '|']}
                            searchable
                            clearable
                        />
                    </Card>
                ) : (
                    <Box>
                        <Group mt="xs" mb="sm">
                            <Button
                                onClick={addTeam}
                                disabled={teams.length >= MAX_TEAMS}
                                variant="outline"
                                color="green"
                                aria-label="팀 추가"
                            >
                                팀 추가
                            </Button>
                            <Button
                                onClick={removeTeam}
                                disabled={teams.length <= MIN_TEAMS}
                                variant="outline"
                                color="red"
                                aria-label="팀 제거"
                            >
                                팀 제거
                            </Button>
                        </Group>

                        <Flex gap="md" wrap="wrap" align="stretch">
                            {teams.map((team, index) => (
                                <Card
                                    withBorder
                                    key={index}
                                    shadow="sm"
                                    padding="lg"
                                    style={{
                                        flex: `1 1 calc(${100 / teams.length}% - 16px)`, // 균등 분배
                                        minWidth: "200px",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <Group mb="sm">
                                        <Text>팀 {index + 1}</Text>
                                    </Group>
                                    <TagsInput
                                        data={transformToOptions(team)}
                                        value={team}
                                        onChange={(tags) => handleTeamChange(index, tags)}
                                        placeholder="닉네임 입력"
                                        variant="unstyled"
                                        splitChars={[',', ' ', '|']}
                                        getCreateLabel={(query: string) => `+ Create "${query}"`}
                                        onCreate={(query: string) => {
                                            query = query.toLowerCase()
                                            setTeams((prevTeams) => {
                                                const updatedTeams = [...prevTeams];
                                                updatedTeams[index].push(query);
                                                return updatedTeams;
                                            });
                                            return query;
                                        }}
                                        searchable
                                    />
                                </Card>
                            ))}
                        </Flex>
                    </Box>
                )}
                <Input.Error>
                    {handleProps.error}
                </Input.Error>
            </Input.Wrapper>
        </Flex>

    );
};

export default TeamSelector;
