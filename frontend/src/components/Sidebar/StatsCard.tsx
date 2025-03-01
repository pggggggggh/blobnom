import {Box, Card, Group, Stack, Text, Title} from '@mantine/core';
import {IconChartHistogram, IconCode, IconUserPlus} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {useSiteStats} from "../../hooks/hooks.tsx";
import {useTranslation} from "react-i18next";


const StatsCard = () => {
    const {t} = useTranslation();
    const {data: statsData, isLoading, error} = useSiteStats();
    return (
        <Card withBorder shadow="sm" p="md">
            <Group justify="space-between" mb="md">
                <Title order={4} style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <IconChartHistogram size={20} color="orange"/>
                    Blobnom {t("통계")}
                </Title>
            </Group>

            <Group>
                <Box style={{flex: 1}}>
                    <Group align="center" gap="xs">
                        <IconUserPlus size={20}/>
                        <Text fw={500}>{t("가입된 회원 수")}</Text>
                    </Group>
                    {isLoading ? (
                        // <Skeleton mt="xs" height={24} width="60%"/>
                        <></>
                    ) : (
                        <Text size="xl" fw={700}>
                            {statsData?.num_members.toLocaleString()}
                        </Text>
                    )}
                </Box>

                <Box style={{flex: 1}}>
                    <Group align="center" gap="xs">
                        <IconCode size={20}/>
                        <Text fw={500}>{t("해결된 문제")}</Text>
                    </Group>
                    {isLoading ? (
                        // <Skeleton mt="xs" height={24} width="60%"/>
                        <></>
                    ) : (
                        <Text size="xl" fw={700}>
                            {statsData?.num_solved_missions.toLocaleString()}
                        </Text>
                    )}
                </Box>
            </Group>

            {statsData &&
                <Stack gap={0} mt="lg" w="100%" justify="flex-end" align="flex-end">
                    {/*{*/}
                    {/*    statsData && statsData.num_active_users > 0 && (*/}
                    {/*        <Text size="sm">현재 {statsData?.num_active_users}명이 함께 문제를 풀고 있습니다.</Text>*/}
                    {/*    )*/}
                    {/*}*/}
                    <Text size="xs" c="dimmed">
                        {t("updated", {t: dayjs(statsData?.updated_at).fromNow()})}
                    </Text>
                </Stack>
            }
        </Card>
    );
}

export default StatsCard;
