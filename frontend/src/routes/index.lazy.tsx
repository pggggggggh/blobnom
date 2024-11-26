import {createLazyFileRoute} from '@tanstack/react-router';
import {Container, Group, Pagination, TextInput} from "@mantine/core";
import {IconSearch} from '@tabler/icons-react';
import {useRoomList} from "../hooks/hooks.tsx";
import RoomListComponent from "../components/RoomListComponent.tsx";

export const Route = createLazyFileRoute('/')({
    component: Index,
})

function Index() {
    const {data: rooms, isLoading, error} = useRoomList();
    if (isLoading || error) return (<div></div>);
    return (
        <Container size="lg">
            <Group justify="space-between" mb="md">
                <Group>
                    <TextInput
                        placeholder="방 검색..."
                        leftSection={<IconSearch size={16}/>}
                    />
                </Group>
            </Group>
            <RoomListComponent rooms={rooms}/>
            <Group justify="center" mt="xl">
                <Pagination total={10}/>
            </Group>
        </Container>
    );
}