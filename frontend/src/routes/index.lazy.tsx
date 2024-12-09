import {createLazyFileRoute} from '@tanstack/react-router';
import {Container, Group, Pagination, TextInput} from "@mantine/core";
import {useRoomList} from "../hooks/hooks.tsx";
import SearchIcon from '@mui/icons-material/Search';
import RoomListComponent from '../components/RoomListComponent.tsx'
import dayjs from "dayjs";
import {useState} from "react";

export const Route = createLazyFileRoute('/')({
    component: Index,
})

function Index() {
    const [page, setPage] = useState(1);
    const {data, isLoading, error} = useRoomList(page - 1);

    const date = dayjs().utc();
    if (isLoading || error) return (<div></div>);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

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
            <RoomListComponent rooms={data["room_list"]} cur_datetime={date}/>
            <Group justify="center" mt="xl">
                <Pagination
                    total={data["total_pages"]}
                    value={page}
                    onChange={handlePageChange}
                />
            </Group>
        </Container>
    );
}