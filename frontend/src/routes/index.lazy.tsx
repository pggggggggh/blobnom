import {createLazyFileRoute} from '@tanstack/react-router';
import {Container, Group, Pagination, TextInput} from "@mantine/core";
import {useRoomList} from "../hooks/hooks.tsx";
import SearchIcon from '@mui/icons-material/Search';
import RoomListComponent from "../components/RoomListComponent.tsx";
import dayjs from "dayjs";

export const Route = createLazyFileRoute('/')({
    component: Index,
})

function Index() {
    const {data: rooms, isLoading, error} = useRoomList();
    const date = dayjs().utc();
    if (isLoading || error) return (<div></div>);
    return (
        <Container size="lg">
            <Group justify="space-between" mb="md">
                <Group>
                    <TextInput
                        placeholder="방 검색..."
                        leftSection={<SearchIcon/>}
                    />
                </Group>
            </Group>
            <RoomListComponent rooms={rooms} cur_datetime={date}/>
            <Group justify="center" mt="xl">
                <Pagination total={10}/>
            </Group>
        </Container>
    );
}