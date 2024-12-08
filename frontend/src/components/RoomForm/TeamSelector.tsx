// src/components/TeamSelector.tsx
import React, { useState, ChangeEvent } from 'react';
import {
    Switch,
    Group,
    Text,
    Button,
    Box,
    Card,
    Flex,
    TagsInput,
} from '@mantine/core';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Option, Team } from '../types';

const MAX_TEAMS = 4;
const MIN_TEAMS = 2;

const transformToOptions = (items: string[]): Option[] =>
    items.map((item) => ({ value: item, label: item }));

const TeamSelector: React.FC = () => {
    const [isTeamMode, setIsTeamMode] = useState<boolean>(false);
    const [individualParticipants, setIndividualParticipants] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([[], []]);

    const handleIndividualChange = (tags: string[]) => {
        setIndividualParticipants(tags);
    };

    const handleTeamChange = (index: number, tags: string[]) => {
        setTeams((prevTeams) => {
            const updatedTeams = [...prevTeams];
            updatedTeams[index] = tags;
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
        const { checked } = event.target;
        setIsTeamMode(checked);
        if (checked) {
            setIndividualParticipants([]);
            setTeams([[], []]);
        } else {
            setTeams([[], []]);
            setIndividualParticipants([]);
        }
    };


    const validateTeams = (): boolean => {
        if (isTeamMode) {
            return teams.every((team) => team.length > 0);
        }
        return individualParticipants.length > 0;
    };

    return (
        <Box p="md">

            <Group position="apart" mb="md">
                <Text size="lg">모드 전환</Text>
                <Switch
                    checked={isTeamMode}
                    onChange={toggleMode}
                    label={isTeamMode ? '팀전' : '개인전'}
                    aria-label="Toggle between Team Mode and Individual Mode"
                />
            </Group>


            {!isTeamMode ? (
                <Card shadow="sm" padding="lg" style={{ minHeight: '200px', minWidth: '400px' }}>
                    <Text mb="sm">참가자 닉네임:</Text>
                    <TagsInput
                        data={transformToOptions(individualParticipants)}
                        value={individualParticipants}
                        onChange={handleIndividualChange}
                        placeholder="handle"
                        creatable
                        variant="unstyled"
                        getCreateLabel={(query: string) => `+ Create "${query}"`}
                        onCreate={(query: string) => {
                            setIndividualParticipants((current) => [...current, query]);
                            return query;
                        }}
                        splitChars={[',', ' ', '|']}
                        searchable
                        clearable
                        styles={{
                            tag: (theme) => ({
                                backgroundColor: theme.colors.blue[6],
                                color: theme.white,
                                '&:hover': {
                                    backgroundColor: theme.colors.blue[7],
                                },
                            }),
                        }}
                    />
                </Card>
            ) : (
                <Box>

                    <Group position="right" mb="sm">
                        <Button
                            leftIcon={<AddIcon />}
                            onClick={addTeam}
                            disabled={teams.length >= MAX_TEAMS}
                            variant="outline"
                            color="green"
                            aria-label="Add Team"
                        >
                            팀 추가
                        </Button>
                        <Button
                            leftIcon={<RemoveIcon />}
                            onClick={removeTeam}
                            disabled={teams.length <= MIN_TEAMS}
                            variant="outline"
                            color="red"
                            aria-label="Remove Team"
                        >
                            팀 제거
                        </Button>
                    </Group>


                    <Flex wrap="wrap" gap="md">
                        {teams.map((team, index) => (
                            <Card
                                key={index}
                                shadow="sm"
                                padding="lg"
                                style={{
                                    flex: '1 1 200px',
                                    minWidth: '200px',
                                    minHeight: '200px',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <Group position="apart" mb="sm">
                                    <Text>팀 {index + 1}</Text>
                                </Group>
                                <TagsInput
                                    data={transformToOptions(team)}
                                    value={team}
                                    onChange={(tags) => handleTeamChange(index, tags)}
                                    placeholder="handle"
                                    creatable
                                    variant="unstyled"
                                    splitChars={[',', ' ', '|']}
                                    getCreateLabel={(query: string) => `+ Create "${query}"`}
                                    onCreate={(query: string) => {
                                        setTeams((prevTeams) => {
                                            const updatedTeams = [...prevTeams];
                                            updatedTeams[index].push(query);
                                            return updatedTeams;
                                        });
                                        return query;
                                    }}
                                    searchable
                                    clearable
                                    styles={{
                                        tag: (theme) => ({
                                            backgroundColor: theme.colors.green[6],
                                            color: theme.white,
                                            '&:hover': {
                                                backgroundColor: theme.colors.green[7],
                                            },
                                        }),
                                    }}
                                />
                            </Card>
                        ))}
                    </Flex>
                </Box>
            )}


            <Box mt="md">
                {!validateTeams() && (
                    <Text c="red" size="sm">
                        {isTeamMode
                            ? '모든 팀에 최소 하나 이상의 참가자가 필요합니다.'
                            : '적어도 하나의 참가자가 필요합니다.'}
                    </Text>
                )}
            </Box>
        </Box>
    );
};

export default TeamSelector;
