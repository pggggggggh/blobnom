import {Card, Group, Table, Title} from '@mantine/core';
import {IconExclamationCircleFilled} from '@tabler/icons-react';
import {useSiteStats} from "../../hooks/hooks.tsx";


const RecentCard = () => {
    const {data: statsData, isLoading, error} = useSiteStats();

    if (isLoading) return <></>;
    return (
        <Card withBorder shadow="sm" p="md">
            <Group justify="space-between" mb="md">
                <Title order={4} style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <IconExclamationCircleFilled size={20}/>
                    최근 소식
                </Title>
            </Group>
            <Table striped>
                <Table.Tbody>
                    <Table.Tr>
                        asdf
                    </Table.Tr>
                    <Table.Tr>
                        asdf
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </Card>
    );
}

export default RecentCard;
