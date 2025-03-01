import {Badge, Flex, Menu, Text, UnstyledButton} from "@mantine/core";
import {IconBell} from "@tabler/icons-react";
import {useTranslation} from "react-i18next";

interface Notification {
    id: number;
    text: string;
    time: string;
}

interface NotificationComponentProps {
    notifications: Notification[];
}

const NotificationComponent = ({notifications}: NotificationComponentProps) => {
    const {t} = useTranslation();
    return (
        <Menu shadow="md" width={320} position="bottom-end">
            <Menu.Target>
                <UnstyledButton pos="relative">
                    <IconBell/>
                    {notifications.length > 0 &&
                        <Badge
                            className="absolute -top-2 -right-2"
                            size="xs"
                            color="red"
                        >
                            <Text size="xs">{notifications.length}</Text>
                        </Badge>
                    }
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>{t("알림")}</Menu.Label>
                {
                    notifications.length > 0 ?
                        (
                            notifications.map((notification) => (
                                <Menu.Item key={notification.id}>
                                    <Flex direction="column">
                                        <Text size="sm">{notification.text}</Text>
                                        <Text size="xs" c="dimmed">{notification.time}</Text>
                                    </Flex>
                                </Menu.Item>
                            )))
                        :
                        <Menu.Item>
                            <span className="text-sm">{t("알림이 없습니다.")}</span>
                        </Menu.Item>
                }
            </Menu.Dropdown>
        </Menu>
    )
}

export default NotificationComponent;