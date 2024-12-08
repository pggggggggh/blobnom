// src/components/TeamSelector.tsx
import React, { useState } from 'react';
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
        console.log(tags);
    };

    const handleTeamChange = (index: number, tags: string[]) => {
        const newTeams = [...teams];
        newTeams[index] = tags;
        setTeams(newTeams);
        console.log(newTeams);
    };

    const addTeam = () => {
        if (teams.length < MAX_TEAMS) {
            setTeams([...teams, []]);
        }
    };

    const removeTeam = () => {
        if (teams.length > MIN_TEAMS) {
            setTeams(teams.slice(0, teams.length - 1));
        }
    };

    const toggleMode = () => {
        setIsTeamMode(!isTeamMode);
        if (isTeamMode) {
            setTeams([[], []]);
        } else {
            setIndividualParticipants([]);
        }
    };

    const validateTeams = (): boolean => {
        if (isTeamMode) {
            return teams.every((team) => team.length > 0);
        } else {
            return individualParticipants.length > 0;
        }
    };

    return (
        <Box p="md">
            <Group position="apart" mb="md">
                <Text size="lg">모드 전환</Text>
                <Switch
                    checked={isTeamMode}
                    onChange={toggleMode}
                    label={isTeamMode ? '팀전' : '개인전'}
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
                        >
                            팀 추가
                        </Button>
                        <Button
                            leftIcon={<RemoveIcon />}
                            onClick={removeTeam}
                            disabled={teams.length <= MIN_TEAMS}
                            variant="outline"
                            color="red"
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
                                    flex: '1 1 15%',
                                    minWidth: '75px',
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
                                    placeholder={`handle`}
                                    creatable
                                    variant="unstyled"
                                    splitChars={[',', ' ', '|']}
                                    getCreateLabel={(query: string) => `+ Create "${query}"`}
                                    onCreate={(query: string) => {
                                        const newTeams = [...teams];
                                        newTeams[index].push(query);
                                        setTeams(newTeams);
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

        </Box>
    );
};

export default TeamSelector;
