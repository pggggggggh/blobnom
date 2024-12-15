import {createLazyFileRoute, Link, useNavigate, useSearch} from '@tanstack/react-router';
import {Button, Checkbox, Container, Group, Pagination, Stack, TextInput} from "@mantine/core";
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
    const navigate = useNavigate();
    const {search = '', page = 1, activeOnly = false} = useSearch({strict: false});
    const debouncedSearch = useDebouncedValue(search, 300)[0] || search;
    const {data, isLoading, error} = useRoomList(page - 1, debouncedSearch, activeOnly);
    const [showNotice, setShowNotice] = useState(true);

    const date = dayjs().utc();
    if (isLoading || error) return (<div></div>);

    const handleSearchChange = (search: string) => {
        navigate({
            search: (old) => ({
                ...old,
                search: search,
                page: 1,
            }),
            replace: false,
        });
    };

    const handlePageChange = (newPage: number) => {
        navigate({
            search: (old) => ({
                ...old,
                page: newPage,
            }),
            replace: false,
        });
    };

    const handleActiveOnlyChange = (activeOnly: boolean) => {
        navigate({
            search: (old) => ({
                ...old,
                activeOnly: activeOnly,
                page: 1,
            }),
            replace: false,
        });
    };


    return (
        <Container size="lg">
            <Stack>
                {/*{showNotice && (*/}
                {/*    <Alert*/}
                {/*        title="공지"*/}
                {/*        color="red"*/}
                {/*        withCloseButton*/}
                {/*        onClose={() => setShowNotice(false)}*/}
                {/*    >*/}
                {/*        Private Room에 새로운 유저의 입장이 되지 않는 현상이 있었고, 수정하였습니다. 불편을 드려 죄송합니다.*/}
                {/*    </Alert>*/}
                {/*)}*/}
                <Group className="flex flex-wrap items-center justify-between">
                    <TextInput
                        placeholder="방 검색..."
                        leftSection={<SearchIcon/>}
                        value={search}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        className="flex-1 min-w-0 mr-2"
                    />
                    <Link to="/create" className="flex-shrink-0">
                        <Button leftSection={<AddIcon/>}>
                            방 만들기
                        </Button>
                    </Link>
                </Group>
                <Group className="flex justify-end">
                    <Checkbox checked={activeOnly}
                              onChange={(event) => handleActiveOnlyChange(event.target.checked)}
                              label="참여 가능한 게임만 표시"/>
                </Group>
                <RoomListComponent rooms={data["room_list"]} cur_datetime={date}/>
                <Group justify="center" mt="xl">
                    <Pagination
                        total={data["total_pages"]}
                        value={page}
                        onChange={handlePageChange}
                    />
                </Group>
            </Stack>
        </Container>
    );
}