import {createLazyFileRoute, Link, useNavigate, useSearch} from '@tanstack/react-router';
import {Alert, Button, Checkbox, Container, Group, Pagination, Stack, TextInput} from "@mantine/core";
import {useRoomList} from "../hooks/hooks.tsx";
import SearchIcon from '@mui/icons-material/Search';
import RoomListComponent from '../components/RoomListComponent.tsx'
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import AddIcon from '@mui/icons-material/Add';
import {useDebouncedValue} from "@mantine/hooks";
import {requestNotificationPermission} from "../utils/NotificationUtils.tsx";


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

    useEffect(() => {
        requestNotificationPermission()
    }, []);

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
                {showNotice && (
                    <Alert
                        title="공지"
                        withCloseButton
                        onClose={() => setShowNotice(false)}
                    >
                        Blobnom 공식 Discord가 오픈했습니다!{" "}
                        <a
                            href="https://discord.gg/Z7tUQZK8"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            https://discord.gg/Z7tUQZK8
                        </a>
                        에서 땅따먹기 같이 할 사람을 구해보세요!
                    </Alert>
                )}
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