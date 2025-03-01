import {useState} from 'react';
import {Box, Card, Flex, Group, Menu, Text, UnstyledButton} from '@mantine/core';
import {IconChevronDown, IconChevronUp} from '@tabler/icons-react';
import {TeamInfo} from "../../types/roomDetails.tsx";
import {Platform} from "../../types/enum/Platforms.tsx";
import HandleComponent from "../HandleComponent.tsx";
import {useTranslation} from "react-i18next";

function TeamStatusBox({roomDetails, userColors, activeUsers}) {
    const [showAll, setShowAll] = useState(true);
    const {t} = useTranslation();

    const toggleView = () => {
        setShowAll(prev => !prev);
    };

    const teamsToShow = showAll
        ? roomDetails.team_info
        : roomDetails.team_info.slice(0, 1);

    return (
        <Card
            className="fixed bottom-4 right-4 shadow-lg"
            padding="xs"
            radius="md"
            w="auto"
        >
            <UnstyledButton
                className="absolute top-2 right-2"
                variant="subtle"
                size="sm"
                onClick={toggleView}
                aria-label="Toggle view mode"
            >
                {showAll ? <IconChevronDown size={16}/> : <IconChevronUp size={16}/>}
            </UnstyledButton>

            <Card.Section pt="lg" pb="sm" px="md">
                {teamsToShow.map((team: TeamInfo, i) => (
                    <Group key={i} align="center" gap="xs">
                        <Box w={7} h={5} bg={userColors[i % userColors.length][0]}/>
                        <Group gap={3} align="center">
                            {team.users.map((player_info, idx) => (
                                <Group key={player_info.user.handle} gap={0} align="center">
                                    <Group gap={1} align="flex-end">
                                        <Menu shadow="md" width={200} position="top">
                                            <Menu.Target>
                                                <Flex align="center" gap={3}>
                                                    <Text
                                                        className="cursor-pointer"
                                                        fw={
                                                            team.users.length > 1 &&
                                                            player_info.indiv_solved_cnt > 0 &&
                                                            idx === 0 ? 800 : 600
                                                        }
                                                    >
                                                        <HandleComponent member={player_info.user}
                                                                         linkToProfile={false}/>
                                                    </Text>
                                                    {activeUsers.has(player_info.user.handle) && (
                                                        <Box
                                                            w={5}
                                                            h={5}
                                                            bg="green"
                                                            title={t("Active")}
                                                            style={{borderRadius: '50%'}}
                                                        />
                                                    )}
                                                </Flex>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item
                                                    component="a"
                                                    href={`/members/${player_info.user.handle}`}
                                                    target="_blank"
                                                >
                                                    {t("프로필 보기")}
                                                </Menu.Item>
                                                <Menu.Item
                                                    component="a"
                                                    href={
                                                        roomDetails.platform === Platform.BOJ
                                                            ? `https://www.acmicpc.net/status?user_id=${player_info.user.accounts[roomDetails.platform]}`
                                                            : `https://codeforces.com/submissions/${player_info.user.accounts[roomDetails.platform]}`
                                                    }
                                                    target="_blank"
                                                >
                                                    {t("제출 기록 보기")}
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                        <Text size="sm">
                                            {team.users.length > 1 && (
                                                player_info.indiv_solved_cnt
                                            )}
                                        </Text>
                                    </Group>
                                </Group>
                            ))}
                            <Text size="sm" c="dimmed">:</Text>
                            <Group gap={1} align="flex-end">
                                <Text fw="bold">{team.adjacent_solved_count}</Text>
                                <Text fw="lighter" c="dimmed" size="xs">({team.total_solved_count})</Text>
                            </Group>
                        </Group>
                    </Group>
                ))}
            </Card.Section>
        </Card>
    );
}

export default TeamStatusBox;