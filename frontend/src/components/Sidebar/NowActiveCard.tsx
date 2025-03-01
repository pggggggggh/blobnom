import {Badge, Button, Card, Group, Stack, Text, Title} from '@mantine/core';
import {IconActivity} from '@tabler/icons-react';
import {useTranslation} from "react-i18next";
import {useActiveUsers} from "../../hooks/hooks.tsx";
import {Link} from "@tanstack/react-router";
import dayjs from "dayjs";

const ActiveUsersRoomsCard = () => {
    const {t} = useTranslation();
    const {data: nowActiveData, isLoading, error} = useActiveUsers()

    return (
        <Card withBorder shadow="sm" p="md">
            <Group justify="space-between" mb="md">
                <Title order={4} style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <IconActivity size={20} color="green"/>
                    {t("현재 접속자")}
                </Title>
                <Badge color="green" variant="light">
                    {nowActiveData && t("active_users", {n: Object.keys(nowActiveData.active_users).length})}
                </Badge>
            </Group>
            {nowActiveData?.active_users && Object.entries(nowActiveData.active_users).map(([handle, roomId]) => {
                return (
                    <Group key={handle} style={{marginBottom: '8px', alignItems: 'center'}}>
                        <Title order={5} style={{flex: 1}}>
                            {handle}
                        </Title>
                        <Group gap="xs" style={{alignItems: 'center'}}>
                            <Text c={roomId === null ? "blue" : roomId > 0 ? "green" : "orange"} size="sm" italic>
                                {roomId === null
                                    ? t("로비")
                                    : roomId > 0
                                        ? ""
                                        : t("연습 중")}
                            </Text>
                            {roomId !== null && roomId > 0 && (
                                <Link to={`rooms/${roomId}`}>
                                    <Button
                                        size="xs"
                                    >
                                        {t("따라가기")}
                                    </Button>
                                </Link>
                            )}
                        </Group>
                    </Group>
                );
            })}
            {nowActiveData &&
                <Stack gap={0} mt="lg" w="100%" justify="flex-end" align="flex-end">
                    <Text size="xs" c="dimmed">
                        {t("updated", {t: dayjs(nowActiveData?.updated_at).fromNow()})}
                    </Text>
                </Stack>
            }
        </Card>
    );
}

export default ActiveUsersRoomsCard;