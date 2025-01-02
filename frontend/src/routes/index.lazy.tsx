import { createLazyFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Alert, Button, Checkbox, Container, Group, Pagination, Stack, TextInput, Skeleton } from "@mantine/core";
import { useRoomList } from "../hooks/hooks.tsx";
import SearchIcon from '@mui/icons-material/Search';
import RoomListComponent from '../components/RoomListComponent.tsx';
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { useDebouncedValue } from "@mantine/hooks";
import { requestNotificationPermission } from "../utils/NotificationUtils.tsx";

export const Route = createLazyFileRoute('/')({
    component: Index,
});

function Index() {
    const navigate = useNavigate();
    const { search = '', page = 1, activeOnly = false } = useSearch({ strict: false });
    const debouncedSearch = useDebouncedValue(search, 300)[0] || search;
    const { data, isLoading, error } = useRoomList(page - 1, debouncedSearch, activeOnly);
    const [showNotice, setShowNotice] = useState(true);
    const date = dayjs().utc();

    useEffect(() => {
        requestNotificationPermission();

    }, []);


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

    const isInitialLoading = isLoading && !data;



    return (
        <Container size="lg">
            <Stack>
                {showNotice && (
                    <Alert
                        title="공지"
                        withCloseButton
                        onClose={() => setShowNotice(false)}
                    >
                        이제 브라우저 상단에서 '알림 권한'을 '허용'으로 놓으시면, 같은 방의 문제 해결 시 알림을 받아보실 수 있습니다!
                    </Alert>
                )}
                <Group className="flex flex-wrap items-center justify-between">
                    {isInitialLoading ? (
                        <Skeleton height={40} width="70%" />
                    ) : (
                        <TextInput
                            placeholder="방 검색..."
                            leftSection={<SearchIcon />}
                            value={search}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            className="flex-1 min-w-0 mr-2"
                        />
                    )}
                    {isInitialLoading ? (
                        <Skeleton height={40} width={100} />
                    ) : (
                        <Link to="/create" className="flex-shrink-0">
                            <Button leftSection={<AddIcon />}>
                                방 만들기
                            </Button>
                        </Link>
                    )}
                </Group>
                <Group className="flex justify-end">
                    {isInitialLoading ? (
                        <Skeleton height={24} width={200} />
                    ) : (
                        <Checkbox
                            checked={activeOnly}
                            onChange={(event) => handleActiveOnlyChange(event.target.checked)}
                            label="참여 가능한 게임만 표시"
                        />
                    )}
                </Group>
                {isInitialLoading ? (

                    <Stack>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} height={50} />
                        ))}
                    </Stack>
                ) : (
                    <RoomListComponent rooms={data.room_list} cur_datetime={date} />
                )}
                <Group justify="center" mt="xl">
                    {isInitialLoading ? (
                        <Skeleton height={40} width={100} />
                    ) : (
                        <Pagination
                            total={data.total_pages}
                            value={page}
                            onChange={handlePageChange}
                        />
                    )}
                </Group>
                {error && (
                    <Alert title="오류" color="red">
                        데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
                    </Alert>
                )}
            </Stack>
        </Container>
    );
}

export default Index;
