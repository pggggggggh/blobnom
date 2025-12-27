import {Box, Card, Group, Skeleton, Text, Title} from '@mantine/core';
import {IconChartHistogram, IconCode, IconUserPlus} from '@tabler/icons-react';
import {useSiteStats} from "../../hooks/hooks.tsx";
import {useTranslation} from "react-i18next";
import UpdatedTime from "../UI/UpdatedTime.tsx";

const StatsCard = () => {
    const {t} = useTranslation();
    const {data: statsData, isLoading, error} = useSiteStats();
    if (!statsData) return null;

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
                        <Skeleton mt="xs" height={24} width="60%"/>
                    ) : (
                        <Text size="xl" fw={700}>{statsData?.num_members.toLocaleString()}</Text>
                    )}
                </Box>

                <Box style={{flex: 1}}>
                    <Group align="center" gap="xs">
                        <IconCode size={20}/>
                        <Text fw={500}>{t("해결된 문제")}</Text>
                    </Group>
                    {isLoading ? (
                        <Skeleton mt="xs" height={24} width="60%"/>
                    ) : (
                        <Text size="xl" fw={700}>{statsData?.num_solved_missions.toLocaleString()}</Text>
                    )}
                </Box>
            </Group>

            <UpdatedTime updated_at={statsData?.updated_at}/>
        </Card>
    );
};

export default StatsCard;
