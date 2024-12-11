import {createLazyFileRoute, Link} from '@tanstack/react-router';
import {Button, Container, Group, Pagination, TextInput} from "@mantine/core";
import {useRoomList} from "../hooks/hooks.tsx";
import SearchIcon from '@mui/icons-material/Search';
import RoomListComponent from '../components/RoomListComponent.tsx'
import dayjs from "dayjs";
import React, {useState} from "react";
import AddIcon from '@mui/icons-material/Add';

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
                <TextInput
                    placeholder="방 검색..."
                    leftSection={<SearchIcon/>}
                />
                <Link to="/create">
                    <Button leftSection={<AddIcon/>}>
                        방 만들기
                    </Button>
                </Link>
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