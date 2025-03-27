import { Badge, Button, Card, Collapse, Group, Skeleton, Text, Title } from '@mantine/core';
import { IconActivity } from '@tabler/icons-react';
import { useTranslation } from "react-i18next";
import { useActiveUsers } from "../../hooks/hooks.tsx";
import { Link } from "@tanstack/react-router";
import UpdatedTime from "../UI/UpdatedTime.tsx";
import HandleComponent from "../HandleComponent.tsx";
import { useState } from "react";

const ActiveUsersRoomsCard = () => {
    const { t } = useTranslation();
    const { data: nowActiveData, isLoading, error } = useActiveUsers();
    const [expanded, setExpanded] = useState(false);

    if (isLoading) {
        return (
            <Card withBorder shadow="sm" p="md">
                <Group justify="space-between" mb="md">
                    <Title order={4} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <IconActivity size={20} color="gray" />
                        <Skeleton height={20} width={120} radius="sm" />
                    </Title>
                    <Skeleton height={24} width={50} radius="sm" />
                </Group>

                <Skeleton height={40} mt="sm" radius="sm" />
                <Skeleton height={40} mt="sm" radius="sm" />
                <Skeleton height={40} mt="sm" radius="sm" />
                <Skeleton height={40} mt="sm" radius="sm" />
                <Skeleton height={40} mt="sm" radius="sm" />

                <UpdatedTime updated_at={undefined} />
            </Card>
        );
    }

    const activeUsersEntries = nowActiveData?.active_users ? Object.entries(nowActiveData.active_users) : [];
    const visibleUsers = expanded ? activeUsersEntries : activeUsersEntries.slice(0, 5);

    return (
        <Card withBorder shadow="sm" p="md">
            <Group justify="space-between" mb="md">
                <Title order={4} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <IconActivity size={20} color="green" />
                    {t("현재 접속자")}
                </Title>
                <Badge color="green" variant="light">
                    {nowActiveData && t("active_users", { n: activeUsersEntries.length })}
                </Badge>
            </Group>

            <Collapse in={visibleUsers.length > 0}>
                {visibleUsers.map(([handle, roomId]) => (
                    <Group key={handle} style={{ marginBottom: '8px', alignItems: 'center' }}>
                        <Title order={5} style={{ flex: 1 }}>
                            <Link to={`/profile/${handle}`}>{handle}</Link></Title>
                        <Group gap="xs" style={{ alignItems: 'center' }}>
                            <Text c={roomId === null ? "blue" : roomId > 0 ? "green" : "orange"} size="sm" italic>
                                {roomId === null ? t("로비") : roomId > 0 ? "" : t("연습 중")}
                            </Text>
                            {roomId !== null && roomId > 0 && (
                                <Link to={`/rooms/${roomId}`}>
                                    <Button size="xs" variant="light">{t("따라가기")}</Button>
                                </Link>
                            )}
                        </Group>
                    </Group>
                ))}
            </Collapse>

            {activeUsersEntries.length > 5 && (
                <Button variant="subtle" fullWidth onClick={() => setExpanded(!expanded)}>
                    {expanded ? t("접기") : t("더보기")}
                </Button>
            )}

            <UpdatedTime updated_at={nowActiveData?.updated_at} />
        </Card>
    );
}

export default ActiveUsersRoomsCard;