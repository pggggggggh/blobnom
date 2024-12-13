import {createLazyFileRoute, Link} from '@tanstack/react-router';
import {Alert, Button, Container, Group, Pagination, TextInput} from "@mantine/core";
import {useRoomList} from "../hooks/hooks.tsx";
import SearchIcon from '@mui/icons-material/Search';
import RoomListComponent from '../components/RoomListComponent.tsx'
import dayjs from "dayjs";
import React, {useState} from "react";
import AddIcon from '@mui/icons-material/Add';
import {useDebouncedValue} from "@mantine/hooks";

export const Route = createLazyFileRoute('/')({
    component: Index,
});

function Index() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const {data, isLoading, error} = useRoomList(page - 1, debouncedSearch);
    const [showNotice, setShowNotice] = useState(true);

    const date = dayjs().utc();
    if (isLoading || error) return (<div></div>);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <Container size="lg">
            {showNotice && (
                <Alert
                    title="공지"
                    color="blue"
                    withCloseButton
                    onClose={() => setShowNotice(false)}
                    mb="md"
                >
                    Blobnom UI가 새롭게 업데이트되었습니다! 팀전, 시작 시간 예약 등 여러 기능도 추가되었습니다. 이용해주셔서 감사드립니다.
                </Alert>
            )}
            <Group className="flex flex-wrap items-center justify-between mb-4">
                <TextInput
                    placeholder="방 검색..."
                    leftSection={<SearchIcon/>}
                    value={search}
                    onChange={handleSearchChange}
                    className="flex-1 min-w-0 mr-2"
                />
                <Link to="/create" className="flex-shrink-0">
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