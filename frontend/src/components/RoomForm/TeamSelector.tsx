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
    handleProps: {
        value: { [key: string]: number };
        onChange: (value: { [key: string]: number }) => void;
        error: string;
    },
    teamModeProps: {
        value: boolean;
        onChange: (value: boolean) => void;
    };
}) => {
    const auth = useAuth();

    const [individualParticipants, setIndividualParticipants] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([[], []]);

    useEffect(() => {
        if (auth?.user) {
            setIndividualParticipants([auth.user]);
        }
    }, [auth?.user]);

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
            setIndividualParticipants(auth?.user ? [auth.user] : []);
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
        <Box>
            <Input.Label className="flex items-center gap-2">
                모드 변경
                <Switch
                    checked={teamModeProps.value}
                    onChange={toggleMode}
                    label={teamModeProps.value ? '팀전' : '개인전'}
                    aria-label="팀 모드와 개인 모드 전환"
                />
            </Input.Label>

            {!teamModeProps.value ? (
                <Card shadow="sm" sx={{minHeight: '200px', minWidth: '400px'}}>
                    <Text mb="sm">참가자 닉네임:</Text>
                    <TagsInput
                        data={transformToOptions(individualParticipants)}
                        value={individualParticipants}
                        onChange={handleIndividualChange}
                        placeholder="닉네임 입력"
                        variant="unstyled"
                        getCreateLabel={(query: string) => `+ Create "${query}"`}
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

                    <Flex gap="md" wrap="nowrap" align="stretch">
                        {teams.map((team, index) => (
                            <Card
                                key={index}
                                shadow="sm"
                                padding="lg"
                                style={{
                                    width: getTeamWidth(teams.length),
                                    boxSizing: 'border-box',
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
                                    creatable
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
        </Box>
    );
};

export default TeamSelector;
